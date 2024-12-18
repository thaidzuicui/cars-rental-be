const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require("multer");
const { storage } = require("../middleware/cloudinary");
const upload = multer({ storage });

// Lấy danh sách xe
router.get("/currentCar/:id", (req, res) => {
  const carId = req.params.id;

  if (!carId) {
    return res.status(400).json({ message: "Car ID is required" });
  }

  // Truy vấn thông tin xe từ bảng `cars`
  const carQuery = "SELECT * FROM cars WHERE car_id = ?";
  db.query(carQuery, [carId], (err, carResults) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (carResults.length === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    const carInfo = carResults[0];

    // Truy vấn ảnh của xe từ bảng `car_imgs`
    const imgQuery = "SELECT img_url FROM car_imgs WHERE car_id = ?";
    db.query(imgQuery, [carId], (err, imgResults) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching images", error: err });
      }

      const images = imgResults.map((img) => img.img_url);

      // Trả về thông tin xe và danh sách ảnh
      return res.json({
        message: "Car details fetched successfully",
        car: {
          ...carInfo,
          images: images,
        },
      });
    });
  });
});



// API cập nhật thông tin xe 
router.put("/updateCar/:car_id", upload.array("images"), async (req, res) => {
  const { car_id } = req.params; // Lấy car_id từ param
  const {
    brand,
    model,
    body_type,
    maximum_gasoline,
    transmission_type,
    location,
    price1day,
    description,
  } = req.body;

  const images = req.files; // Lấy danh sách ảnh từ request

  // Kiểm tra các trường cần thiết
  if (
    !brand ||
    !model ||
    !body_type ||
    !maximum_gasoline ||
    !transmission_type ||
    !location ||
    !price1day ||
    !description
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Cập nhật thông tin xe
    const query = `
      UPDATE cars 
      SET brand = ?, model = ?, body_type = ?, maximum_gasoline = ?, transmission_type = ?, location = ?, price1day = ?, description = ?
      WHERE car_id = ?
    `;
    const values = [
      brand,
      model,
      body_type,
      maximum_gasoline,
      transmission_type,
      location,
      price1day,
      description,
      car_id,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Car not found" });
      }

      // Nếu có ảnh mới, thêm vào bảng car_imgs
      if (images && images.length > 0) {
        const insertImagesQuery = `
          INSERT INTO car_imgs (car_id, img_url)
          VALUES ${images.map(() => "(?, ?)").join(", ")}
        `;

        const imageValues = images.flatMap((image) => [car_id, image.path]);

        db.query(insertImagesQuery, imageValues, (imgErr) => {
          if (imgErr) {
            return res
              .status(500)
              .json({ message: "Error updating car images", error: imgErr.message });
          }
        });
      } 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }

  res.json({ message: "Car updated successfully!" });
});


// Xóa xe
router.delete('/deleteCar/:car_id', (req, res) => {
  const { car_id } = req.params; // Lấy car_id từ params

  // Kiểm tra xem car_id có được gửi hay không
  if (!car_id) {
    return res.status(400).json({ message: 'Car ID is required' });
  }

  const query = 'DELETE FROM cars WHERE car_id = ?';
  db.query(query, [car_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully!' });
  });
});


// API thêm xe cho thuê
router.post("/addCar", upload.array("images"), (req, res) => {
  const {
    brand,
    model,
    body_type,
    maximum_gasoline,
    transmission_type,
    location,
    price1day,
    description,
  } = req.body;

  const images = req.files; // Danh sách các file ảnh

  // Kiểm tra dữ liệu đầu vào
  if (
    !brand ||
    !model ||
    !body_type ||
    !maximum_gasoline ||
    !transmission_type ||
    !location ||
    !price1day ||
    !description ||
    images.length === 0
  ) {
    return res.status(400).json({ message: "Missing required fields or images" });
  }

  // Query thêm xe vào bảng cars
  const carQuery = `
    INSERT INTO cars (
      brand, model, body_type, maximum_gasoline, transmission_type, location, price1day, description
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    carQuery,
    [
      brand,
      model,
      body_type,
      maximum_gasoline,
      transmission_type,
      location,
      price1day,
      description,
    ],
    (err, carResult) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      const carId = carResult.insertId; // Lấy car_id của xe vừa thêm

      // Query thêm từng ảnh vào bảng car_imgs
      const imgQuery = `INSERT INTO car_imgs (img_url, car_id) VALUES (?, ?)`;

      // Lưu ảnh vào database
      const imagePromises = images.map((image) => {
        return new Promise((resolve, reject) => {
          db.query(imgQuery, [image.path, carId], (imgErr, imgResult) => {
            if (imgErr) return reject(imgErr);
            resolve(imgResult);
          });
        });
      });

      // Chờ tất cả ảnh được lưu
      Promise.all(imagePromises)
        .then(() => {
          res.status(201).json({
            message: "Car and images added successfully",
            carId: carId,
            images: images.map((img) => img.path),
          });
        })
        .catch((imgErr) => {
          res.status(500).json({ message: "Failed to save images", error: imgErr });
        });
    }
  );
});


module.exports = router;
