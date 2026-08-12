exports.getDashboardData = async (req, res) => {
  try {
    // Scalable sidebar configuration structure
    const sidebarModules = [
      {
        id: 'bhajan-mala',
        title: 'Bhajan Mala',
        route: '/dashboard/bhajan-mala',
        icon: 'music',
      },
      {
        id: 'aakhyan-mala',
        title: 'Aakhyan Mala',
        route: '/dashboard/aakhyan-mala',
        icon: 'book',
      },
      {
        id: 'gallery',
        title: 'Gallery',
        route: '/dashboard/gallery',
        icon: 'image',
      },
    ];

    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        email_address: req.user.email_address,
      },
      sidebarModules,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};