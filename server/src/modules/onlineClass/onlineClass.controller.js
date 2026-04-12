import { OnlineClass } from './onlineClass.model.js';
import { ioInstance } from '../../socket.js';

// GET: /api/v1/classes (Teachers get theirs, Students get active ones in their section)
export async function getLiveClasses(req, res, next) {
  try {
    const userRole = req.user.role;
    let classes = [];

    if (userRole === 'student') {
      classes = await OnlineClass.find({ 
        section: req.user.section, 
        status: 'live' 
      }).populate('teacherId', 'fullName');
    } else if (userRole === 'teacher') {
      // Teachers see all classes they created, sort by most recent
      classes = await OnlineClass.find({ teacherId: req.user._id })
        .populate('teacherId', 'fullName')
        .sort({ createdAt: -1 });
    } else {
      classes = await OnlineClass.find()
        .populate('teacherId', 'fullName')
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({ success: true, data: classes });
  } catch (error) {
    return next(error);
  }
}

// GET: /api/v1/classes/:id
export async function getClassById(req, res, next) {
  try {
    const classSession = await OnlineClass.findById(req.params.id).populate('teacherId', 'fullName');
    if (!classSession) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }
    return res.status(200).json({ success: true, data: classSession });
  } catch (error) {
    return next(error);
  }
}

// POST: /api/v1/classes
export async function createLiveClass(req, res, next) {
  try {
    const { title, subject, section } = req.body;
    
    // Automatically make it 'live' upon creation
    const newClass = await OnlineClass.create({
      title,
      subject,
      section,
      teacherId: req.user._id,
      status: 'live'
    });

    return res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    return next(error);
  }
}

// PUT: /api/v1/classes/:id/end
export async function endClass(req, res, next) {
  try {
    const classSession = await OnlineClass.findById(req.params.id);
    
    if (!classSession) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classSession.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to end this class' });
    }

    classSession.status = 'ended';
    classSession.endTime = Date.now();
    await classSession.save();

    // Globally emit to all connected students to boot them out
    if (ioInstance) {
      ioInstance.to(classSession._id.toString()).emit('class-ended');
    }

    return res.status(200).json({ success: true, data: classSession });
  } catch (error) {
    return next(error);
  }
}
