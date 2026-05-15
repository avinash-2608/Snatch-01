const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { role, name, email, password, storeName, location, phone } = req.body;

    if (!role || !email || !password) {
      return res.status(400).json({ message: 'Role, email, and password are required' });
    }

    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin registration is not allowed' });
    }

    // Basic check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newUser = new User({
      role,
      name,
      email,
      password, // Note: In a real app, hash password using bcrypt
      storeName,
      location,
      phone,
      approved: role === 'store' ? false : undefined
    });

    await newUser.save();
    res.status(201).json({ message: 'Signup successful', user: newUser });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    // Step 1: Check if role === admin
    if (role === 'admin') {
      if (email === 'avinash260805@gmail.com' && password === '123') {
        return res.status(200).json({
          message: 'Login successful',
          user: { role: 'admin', email: 'avinash260805@gmail.com', name: 'Super Admin', _id: 'admin_123' }
        });
      } else {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
    }

    // Steps 2 & 3: Find user by email AND role. If not found, invalid
    const user = await User.findOne({ email, role });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If role is store and not approved
    if (role === 'store' && !user.approved) {
      return res.status(403).json({ message: 'Your account is under review' });
    }

    // Check Premium Expiry organically
    if (user.isPremium && user.premiumExpiry && new Date(user.premiumExpiry) < new Date()) {
      user.isPremium = false;
      user.premiumExpiry = null;
      await user.save();
    }

    // Step 5: Otherwise return user
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === 'admin_123') {
      return res.status(200).json({
        user: { role: 'admin', email: 'avinash260805@gmail.com', name: 'Super Admin', _id: 'admin_123', snatchTokens: 0 }
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
