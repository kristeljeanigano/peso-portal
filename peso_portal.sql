-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 08, 2026 at 04:36 AM
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
-- Database: `peso_portal`
--

-- --------------------------------------------------------

--
-- Table structure for table `employer_profiles`
--

CREATE TABLE `employer_profiles` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `company_name` varchar(200) NOT NULL,
  `industry` varchar(120) DEFAULT NULL,
  `position_title` varchar(120) DEFAULT NULL,
  `company_size` varchar(40) DEFAULT NULL,
  `business_permit_no` varchar(80) DEFAULT NULL,
  `company_address` varchar(255) DEFAULT NULL,
  `website` varchar(190) DEFAULT NULL,
  `hiring_count` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `permit_filename` varchar(255) DEFAULT NULL,
  `permit_original` varchar(255) DEFAULT NULL,
  `consent` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobseeker_profiles`
--

CREATE TABLE `jobseeker_profiles` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `birthdate` date DEFAULT NULL,
  `sex` varchar(20) DEFAULT NULL,
  `barangay` varchar(120) DEFAULT NULL,
  `city` varchar(120) DEFAULT NULL,
  `highest_education` varchar(60) DEFAULT NULL,
  `course` varchar(150) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `experience_years` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `resume_filename` varchar(255) DEFAULT NULL,
  `resume_original` varchar(255) DEFAULT NULL,
  `preferred_job_type` varchar(60) DEFAULT NULL,
  `preferred_location` varchar(150) DEFAULT NULL,
  `expected_salary` decimal(10,2) DEFAULT NULL,
  `availability` varchar(60) DEFAULT NULL,
  `consent` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jobseeker_profiles`
--

INSERT INTO `jobseeker_profiles` (`user_id`, `birthdate`, `sex`, `barangay`, `city`, `highest_education`, `course`, `skills`, `experience_years`, `resume_filename`, `resume_original`, `preferred_job_type`, `preferred_location`, `expected_salary`, `availability`, `consent`) VALUES
(3, '2005-03-20', 'female', 'Magbangon', 'Cabucgayan', 'College graduate', '', 'MS Office', 1, 'f1cf2a2efe36322b87a3517bbe75659d.docx', 'converted.docx', 'Full-time', 'Home', 30000.00, 'Immediately', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `tracking_id` varchar(24) NOT NULL,
  `role` enum('jobseeker','employer') NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `status` enum('pending','active','rejected') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `tracking_id`, `role`, `email`, `password_hash`, `first_name`, `last_name`, `mobile`, `status`, `created_at`) VALUES
(3, 'PESO-2026-A65D11', 'jobseeker', 'kristeljeanigano5@gmail.com', '$2y$10$AlNUaQAks3ZQVtF0ptUS6Oq68ucnUCvSCBPHE9dVT6iosJQTRcUE2', 'Kristel Jean', 'Igano', '09876543210', 'active', '2026-11-04 14:38:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employer_profiles`
--
ALTER TABLE `employer_profiles`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `jobseeker_profiles`
--
ALTER TABLE `jobseeker_profiles`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_id` (`tracking_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employer_profiles`
--
ALTER TABLE `employer_profiles`
  ADD CONSTRAINT `employer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jobseeker_profiles`
--
ALTER TABLE `jobseeker_profiles`
  ADD CONSTRAINT `jobseeker_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
