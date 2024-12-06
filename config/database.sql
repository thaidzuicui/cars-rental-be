-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: carrental
-- ------------------------------------------------------
-- Server version	5.7.21-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cars`
--

/*DROP TABLE IF EXISTS `cars`;*/
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE Database tables;
use tables;

CREATE TABLE `cars` (
  `car_id` int(4) NOT NULL AUTO_INCREMENT,
  `brand` varchar(20) default null,
  `model` varchar(10) DEFAULT NULL,
  `date` int(4) DEFAULT NULL,
  `body_type` varchar(10) default null,
  `available_from` date DEFAULT NULL,
  `available_to` date DEFAULT NULL,
  `maximum_gasoline` int(2) default null,
  `transmission_type` varchar(15) default null,
  `location` varchar(15) default null,
  `price1day` decimal(5,2) not null, 
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`car_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1038 DEFAULT CHARSET=utf8;


/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cars`
--

LOCK TABLES `cars` WRITE;
/*!40000 ALTER TABLE `cars` DISABLE KEYS */;
/*!40000 ALTER TABLE `cars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `car_imgs`
--

DROP TABLE IF EXISTS `car_imgs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `car_imgs` (
`img_id` int(11) NOT NULL AUTO_INCREMENT,
`img_url` VARCHAR(255) NOT NULL,
`car_id` int(11) NOT NULL,
PRIMARY KEY (`img_id`),
KEY `car_id` (`car_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `car_imgs`
--

LOCK TABLES `car_imgs` WRITE;
/*!40000 ALTER TABLE `car_imgs` DISABLE KEYS */;
/*!40000 ALTER TABLE `car_imgs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `users` (
`user_id` int(11) NOT NULL AUTO_INCREMENT,
`google_id` int(20) default null,
`username` varchar(50) NOT NULL,
`last_name` varchar(50) NOT NULL,
`first_name` varchar(50) NOT NULL,
`profile_image` varchar(255) NOT NULL,
`email` varchar(50) not null,
`img_url` VARCHAR(255) default NULL,
`create_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `car_review`
--

DROP TABLE IF EXISTS `car_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `car_review` (
`review_id` int(11) NOT NULL AUTO_INCREMENT,
`review` varchar(100) NOT NULL,
`review_score` int(1) NOT NULL,
`date` date NOT NULL,
`user_id` int(11) NOT NULL,
`car_id` int(11) NOT NULL,
PRIMARY KEY (`review_id`),
KEY `user_id` (`user_id`),
KEY `car_id` (`car_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `car_review`
--

LOCK TABLES `car_review` WRITE;
/*!40000 ALTER TABLE `car_review` DISABLE KEYS */;
/*!40000 ALTER TABLE `car_review` ENABLE KEYS */;
UNLOCK TABLES;


--
-- Table structure for table `rental`
--

DROP TABLE IF EXISTS `rental`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `rental` (
`rental_id` int(11) NOT NULL AUTO_INCREMENT,
`rental_date` date NOT NULL,
`rental_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
`return_date` date NOT NULL,
`car_id` int(11) NOT NULL,
`user_id` int(11) NOT NULL,
`payment_amount` float NOT NULL,
`rental_status` int(1) NOT NULL,
PRIMARY KEY (`rental_id`),
KEY `car_id` (`car_id`),
KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rental`
--

LOCK TABLES `rental` WRITE;
/*!40000 ALTER TABLE `rental` DISABLE KEYS */;
/*!40000 ALTER TABLE `rental` ENABLE KEYS */;
UNLOCK TABLES;