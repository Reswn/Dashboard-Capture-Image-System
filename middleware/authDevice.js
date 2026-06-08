function authDevice(req, res, next) {
  const deviceKey = req.headers["x-device-key"];
  const serverDeviceKey = process.env.DEVICE_SECRET_KEY;

  if (!serverDeviceKey) {
    return res.status(500).json({
      success: false,
      message: "DEVICE_SECRET_KEY belum diatur di server",
    });
  }

  if (!deviceKey) {
    return res.status(401).json({
      success: false,
      message: "Header x-device-key wajib dikirim",
    });
  }

  if (deviceKey !== serverDeviceKey) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized device",
    });
  }

  next();
}

module.exports = authDevice;