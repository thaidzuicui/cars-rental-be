const express = require("express");
const router = express.Router();
const db = require("../config/db");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage: storage });
const moment = require("moment");
const verifyToken = require("../middleware/verifyToken.js"); // Middleware kiểm tra token

router.get("/popularCars", (req, res) => {
  const query = `SELECT c.car_id, c.brand, c.model, c.body_type, c.location, c.price1day, c.description, c.rate, c.maximum_gasoline, c.transmission_type, c.capacity,
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
    SELECT c.car_id, c.brand, c.model, c.body_type, c.location, c.price1day, c.description, c.rate
    FROM cars c
    JOIN likes l ON c.car_id = l.car_id
    WHERE l.user_id = ?
  `;

  db.query(query, [userId], (err, cars) => {
    if (err) return res.status(500).json({ error: "Database query error" });

    // Sử dụng Promise.all để lấy hình ảnh, bookings và liked cho từng xe
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

            // Trả về xe với tất cả thông tin
            car.liked = true; // Xe này đã được like bởi người dùng

            resolve(car); // Trả về xe với tất cả thông tin
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
          .json({ error: "Failed to fetch car images or bookings" })
      );
  });
});

// router.get("/:id", (req, res) => {
//   const query = "SELECT * FROM cars WHERE car_id = ?";
//   db.query(query, [req.params.id], (err, results) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json(results[0]);
//   });
// });

router.get("/allCars", (req, res) => {
  const query = "SELECT * FROM cars";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Cập nhật thông tin xe
router.put("/updateCar", (req, res) => {
  const { brand, model, body_type, price1day, description } = req.body;
  const query =
    "UPDATE cars SET brand = ?, model = ?, body_type = ?, price1day = ?, description = ? WHERE car_id = ?";
  db.query(
    query,
    [brand, model, body_type, price1day, description, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Car updated successfully!" });
    }
  );
});

// Xóa xe
router.delete("/:DeleteCar", (req, res) => {
  const query = "DELETE FROM cars WHERE car_id = ?";
  db.query(query, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Car deleted successfully!" });
  });
});

// API thêm xe cho thuê
router.post("/addCar", upload.single("image"), (req, res) => {
  console.log("Body: ", req.body); // Log toàn bộ dữ liệu gửi lên
  console.log("File: ", req.file); // Log file upload

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

  const imageUrl = req.file?.path; // Đường dẫn ảnh trên Cloudinary

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
    !imageUrl
  ) {
    return res.status(400).json({ message: "Missing required fields" });
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

      // Query thêm ảnh vào bảng car_imgs
      const imgQuery = `
        INSERT INTO car_imgs (img_url, car_id)
        VALUES (?, ?)`;

      db.query(imgQuery, [imageUrl, carId], (imgErr, imgResult) => {
        if (imgErr) {
          return res
            .status(500)
            .json({ message: "Failed to save image", error: imgErr });
        }

        res.status(201).json({
          message: "Car added successfully",
          carId: carId,
          imageUrl: imageUrl,
        });
      });
    }
  );
});

module.exports = router;
