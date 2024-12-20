const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const { storage } = require("../middleware/cloudinary");
const upload = multer({ storage });
const verifyToken = require("../middleware/verifyToken");

router.get("/popularCars", (req, res) => {
  const query = `SELECT c.car_id, c.brand, c.model, c.body_type, c.location, c.price1day, c.description, c.maximum_gasoline, c.transmission_type, c.capacity,
            COUNT(r.rental_id) AS rental_count
     FROM cars c
     LEFT JOIN rental r ON c.car_id = r.car_id
     GROUP BY c.car_id
     ORDER BY rental_count DESC;`;

  db.query(query, (err, cars) => {
    if (err) return res.status(500).json({ error: "Database query error" });

    // Sử dụng Promise.all để lấy hình ảnh, bookings và likes cho từng xe
    const promises = cars.map((car) => {
      return new Promise((resolve, reject) => {
        // Truy vấn lấy hình ảnh của xe
        const imgQuery = "SELECT img_url FROM car_imgs WHERE car_id = ?";
        db.query(imgQuery, [car.car_id], (err, imgUrls) => {
          if (err) return reject("Error fetching images: " + err);

          // Thêm hình ảnh vào thuộc tính car_imgs
          car.car_imgs = imgUrls.map((img) => img.img_url);

          // Truy vấn lấy bookings (rental_date và return_date) với điều kiện return_date > ngày hôm nay
          const bookingsQuery = `SELECT rental_date, return_date 
             FROM rental 
             WHERE car_id = ? AND return_date > CURRENT_TIMESTAMP`;
          db.query(bookingsQuery, [car.car_id], (err, bookings) => {
            if (err) return reject("Error fetching bookings: " + err);

            // Thêm bookings vào thuộc tính bookings của xe
            car.bookings = bookings.map((booking) => ({
              rental_date: booking.rental_date,
              return_date: booking.return_date,
            }));

            // Truy vấn lấy danh sách user_id đã like chiếc xe này
            const likesQuery = "SELECT user_id FROM likes WHERE car_id = ?";
            db.query(likesQuery, [car.car_id], (err, likesResult) => {
              if (err) return reject("Error fetching likes: " + err);

              // Thêm danh sách user_id vào thuộc tính likes
              car.likes = likesResult.map((like) => like.user_id);

              resolve(car); // Trả về xe với tất cả thông tin
            });
          });
        });
      });
    });

    Promise.all(promises)
      .then((carsWithDetails) => res.json(carsWithDetails))
      .catch((error) => res.status(500).json({ error }));
  });
});

router.get("/likedCars", verifyToken, (req, res) => {
  const userId = req.userId; // Lấy userId từ token (verifyToken middleware)

  // Truy vấn lấy danh sách xe mà người dùng đã like
  const query = `
    SELECT c.car_id, c.brand, c.model, c.body_type, c.location, c.price1day, c.description, c.capacity
    FROM cars c
    JOIN likes l ON c.car_id = l.car_id
    WHERE l.user_id = ?
  `;

  db.query(query, [userId], (err, cars) => {
    if (err) return res.status(500).json({ error: "Database query error" });

    // Sử dụng Promise.all để lấy hình ảnh, bookings và likes cho từng xe
    const promises = cars.map((car) => {
      return new Promise((resolve, reject) => {
        // Truy vấn lấy hình ảnh của xe
        const imgQuery = "SELECT img_url FROM car_imgs WHERE car_id = ?";
        db.query(imgQuery, [car.car_id], (err, imgUrls) => {
          if (err) return reject("Error fetching images: " + err);

          // Thêm hình ảnh vào thuộc tính car_imgs
          car.car_imgs = imgUrls.map((img) => img.img_url);

          // Truy vấn lấy bookings (rental_date và return_date) với điều kiện return_date > ngày hôm nay
          const bookingsQuery = `
            SELECT rental_date, return_date 
            FROM rental 
            WHERE car_id = ? AND return_date > CURRENT_TIMESTAMP
          `;
          db.query(bookingsQuery, [car.car_id], (err, bookings) => {
            if (err) return reject("Error fetching bookings: " + err);

            // Thêm bookings vào thuộc tính bookings của xe
            car.bookings = bookings.map((booking) => ({
              rental_date: booking.rental_date,
              return_date: booking.return_date,
            }));

            // Truy vấn lấy danh sách user_id đã like chiếc xe này
            const likesQuery = "SELECT user_id FROM likes WHERE car_id = ?";
            db.query(likesQuery, [car.car_id], (err, likesResult) => {
              if (err) return reject("Error fetching likes: " + err);

              // Thêm danh sách user_id vào thuộc tính likes
              car.likes = likesResult.map((like) => like.user_id);

              resolve(car); // Trả về xe với tất cả thông tin
            });
          });
        });
      });
    });

    // Chờ tất cả Promise hoàn tất
    Promise.all(promises)
      .then((result) => res.json(result)) // Trả về kết quả cho client
      .catch((error) =>
        res
          .status(500)
          .json({ error: "Failed to fetch car images, bookings, or likes" })
      );
  });
});

router.get("/allCars", (req, res) => {
  const query = `
    SELECT c.car_id, c.brand, c.model, c.body_type, c.location, c.price1day, c.description, 
           c.maximum_gasoline, c.transmission_type, c.capacity, c.rate
    FROM cars c
  `;

  db.query(query, (err, cars) => {
    if (err) return res.status(500).json({ error: "Database query error" });

    // Sử dụng Promise.all để lấy hình ảnh, bookings và likes cho từng xe
    const promises = cars.map((car) => {
      return new Promise((resolve, reject) => {
        // Truy vấn lấy hình ảnh của xe
        const imgQuery = "SELECT img_url FROM car_imgs WHERE car_id = ?";
        db.query(imgQuery, [car.car_id], (err, imgUrls) => {
          if (err) return reject("Error fetching images: " + err);

          // Thêm hình ảnh vào thuộc tính car_imgs
          car.car_imgs = imgUrls.map((img) => img.img_url);

          // Truy vấn lấy bookings (rental_date và return_date) với điều kiện return_date > ngày hôm nay
          const bookingsQuery = `
            SELECT rental_date, return_date 
            FROM rental 
            WHERE car_id = ? AND return_date > CURRENT_TIMESTAMP
          `;
          db.query(bookingsQuery, [car.car_id], (err, bookings) => {
            if (err) return reject("Error fetching bookings: " + err);

            // Thêm bookings vào thuộc tính bookings của xe
            car.bookings = bookings.map((booking) => ({
              rental_date: booking.rental_date,
              return_date: booking.return_date,
            }));

            // Truy vấn lấy danh sách user_id đã like chiếc xe này
            const likesQuery = "SELECT user_id FROM likes WHERE car_id = ?";
            db.query(likesQuery, [car.car_id], (err, likesResult) => {
              if (err) return reject("Error fetching likes: " + err);

              // Thêm danh sách user_id vào thuộc tính likes
              car.likes = likesResult.map((like) => like.user_id);

              resolve(car); // Trả về xe với tất cả thông tin
            });
          });
        });
      });
    });

    Promise.all(promises)
      .then((carsWithDetails) => res.json(carsWithDetails))
      .catch((error) =>
        res.status(500).json({ error: "Failed to fetch car details" })
      );
  });
});

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
        return res
          .status(500)
          .json({ message: "Error fetching images", error: err });
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
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
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
            return res.status(500).json({
              message: "Error updating car images",
              error: imgErr.message,
            });
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
router.delete("/deleteCar/:car_id", (req, res) => {
  const { car_id } = req.params; // Lấy car_id từ params

  // Kiểm tra xem car_id có được gửi hay không
  if (!car_id) {
    return res.status(400).json({ message: "Car ID is required" });
  }

  const query = "DELETE FROM cars WHERE car_id = ?";
  db.query(query, [car_id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Database error", error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({ message: "Car deleted successfully!" });
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
    return res
      .status(400)
      .json({ message: "Missing required fields or images" });
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
          res
            .status(500)
            .json({ message: "Failed to save images", error: imgErr });
        });
    }
  );
});

module.exports = router;
