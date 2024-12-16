-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 14, 2024 at 06:51 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `carrental`
--

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `car_id` int(4) NOT NULL,
  `brand` varchar(20) DEFAULT NULL,
  `model` varchar(10) DEFAULT NULL,
  `body_type` varchar(10) DEFAULT NULL,
  `maximum_gasoline` int(2) DEFAULT NULL,
  `transmission_type` varchar(15) DEFAULT NULL,
  `location` varchar(15) DEFAULT NULL,
  `price1day` decimal(5,2) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `cars`
--

INSERT INTO `cars` (`car_id`, `brand`, `model`, `body_type`, `maximum_gasoline`, `transmission_type`, `location`, `price1day`, `description`) VALUES
(1038, 'Toyota', 'Corolla', 'Sedan', 45, 'Automatic', 'Hanoi', 50.00, 'Mẫu xe tiết kiệm nhiên liệu');

-- --------------------------------------------------------

--
-- Table structure for table `car_imgs`
--

CREATE TABLE `car_imgs` (
  `img_id` int(11) NOT NULL,
  `img_url` varchar(255) NOT NULL,
  `car_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `car_imgs`
--

INSERT INTO `car_imgs` (`img_id`, `img_url`, `car_id`) VALUES
(1, 'https://res.cloudinary.com/dimiy3oc6/image/upload/v1734153095/car_rental_images/rehyl0ij8ru6salboqii.jpg', 1038);

-- --------------------------------------------------------

--
-- Table structure for table `car_review`
--

CREATE TABLE `car_review` (
  `review_id` int(11) NOT NULL,
  `review` varchar(100) NOT NULL,
  `review_score` int(1) NOT NULL,
  `date` date NOT NULL,
  `user_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `like_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`like_id`, `user_id`, `car_id`) VALUES
(2, 1, 1038),
(5, 1, 108);

-- --------------------------------------------------------

--
-- Table structure for table `rental`
--

CREATE TABLE `rental` (
  `rental_id` int(11) NOT NULL,
  `rental_date` date NOT NULL,
  `rental_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `return_date` date NOT NULL,
  `car_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `payment_amount` float NOT NULL,
  `rental_status` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `bio` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `profile_image` varchar(255) NOT NULL,
  `email` varchar(50) DEFAULT NULL,
  `create_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `username`, `bio`, `password`, `profile_image`, `email`, `create_at`) VALUES
(1, 'DO Hoai Nam', 'HoaiNam', NULL, '$2b$10$U/1z1na84ZqH.s08BqQxXO7BsVVPrr5g0F2ls1nSyfXzkOhs9XVpS', 'https://i.pinimg.com/236x/b8/2a/6d/b82a6d7d7db5a9ec0f096db7029330cb.jpg', NULL, '2024-12-14 05:24:16'),
(2, 'DO Hoai Nam nha', 'Namdeptrai', NULL, '$2b$10$vbj90hjUZPo6YLkhZpb.8upba/lkaBPidzIyfBWrcbkbwu2LTeiae', 'https://i.pinimg.com/236x/b8/2a/6d/b82a6d7d7db5a9ec0f096db7029330cb.jpg', NULL, '2024-12-14 05:30:23'),
(3, 'DO Hoai Nam dsha', 'Namdai', NULL, '$2b$10$WyeHAbUuBXXx9/.PfAgWzuAQ4CHMjwnBvpqrwH0qFVgGjLhpv.oTO', 'https://i.pinimg.com/236x/b8/2a/6d/b82a6d7d7db5a9ec0f096db7029330cb.jpg', 'Hoainam.22tq@gmail.com', '2024-12-14 05:44:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`car_id`);

--
-- Indexes for table `car_imgs`
--
ALTER TABLE `car_imgs`
  ADD PRIMARY KEY (`img_id`),
  ADD KEY `car_id` (`car_id`);

--
-- Indexes for table `car_review`
--
ALTER TABLE `car_review`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `car_id` (`car_id`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`like_id`),
  ADD KEY `car_id` (`car_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `rental`
--
ALTER TABLE `rental`
  ADD PRIMARY KEY (`rental_id`),
  ADD KEY `car_id` (`car_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cars`
--
ALTER TABLE `cars`
  MODIFY `car_id` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1039;

--
-- AUTO_INCREMENT for table `car_imgs`
--
ALTER TABLE `car_imgs`
  MODIFY `img_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `car_review`
--
ALTER TABLE `car_review`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `like_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `rental`
--
ALTER TABLE `rental`
  MODIFY `rental_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
