-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 19, 2025 at 01:32 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `service_azip`
--

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `module_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `display_name`, `type`, `module_name`, `created_at`, `updated_at`) VALUES
(1, 'Dashboard', 'module', 'App/User', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(2, 'Data Import', 'module', 'App/DataImport', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(3, 'Text Messages', 'module', 'App/TextMessage', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(4, 'Company Information', 'module', 'App/CompanyInformation', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(5, 'Company Preferences', 'module', 'App/CompanyPreference', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(6, 'Payment Gateway Settings', 'module', 'App/PaymentGatewaySetting', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(7, 'Estimate & Job Statuses', 'module', 'App/Estimate&JobStatuse', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(8, 'Service Contract Terms', 'module', 'App/ServiceContractTerm', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(9, 'Communication Templates', 'module', 'App/CommunicationTemplate', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(10, 'Outbound Email Settings', 'module', 'App/OutboundEmailSetting', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(11, 'Electronic Fax Settings', 'module', 'App/ElectronicFaxSetting', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(12, 'Online & App Booking Settings', 'module', 'App/Online&AppBookingSetting', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(13, 'Referral Sources', 'module', 'App/ReferralSource', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(14, 'Workforce Management', 'module', 'App/WorkforceManagement', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(15, 'Service Agreement Management', 'module', 'App/ServiceAgreementManagement', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(16, 'Integrations', 'module', 'App/Integration', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(17, 'Crew Management', 'module', 'App/CrewManagement', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(18, 'Fleet Management', 'module', 'App/FleetManagement', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(19, 'Vendor Management', 'module', 'App/VendorManagement', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(20, 'Inventory Management', 'module', 'App/InventoryManagement', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(21, 'Product Catalog', 'module', 'App/ProductCatalog', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(22, 'Purchase Orders Management', 'module', 'App/PurchaseOrdersManagement', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(23, 'Service Catalog', 'module', 'App/ServiceCatalog', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(24, 'Taxes, Fees & Discounts', 'module', 'App/Taxes,Fees&Discount', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(25, 'Job Categories', 'module', 'App/JobCategorie', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(26, 'Company Memos', 'module', 'App/CompanyMemo', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(27, 'Notification Templates', 'module', 'App/NotificationTemplate', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(28, 'Customers', 'module', 'App/User', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(29, 'Projects', 'module', 'App/Project', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(30, 'Grid', 'module', 'App/User', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(31, 'Dispatch Zones', 'module', 'App/DispatchZone', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(32, 'Fleet Tracking', 'module', 'App/FleetTracking', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(33, 'Calendar', 'module', 'App/User', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(34, 'Invoices', 'module', 'App/Invoice', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(35, 'Invoice Payments', 'module', 'App/InvoicePayment', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(36, 'Sales Revenue', 'module', 'App/SalesRevenue', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(37, 'Sales Commission', 'module', 'App/SalesCommission', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(38, 'Payroll', 'module', 'App/Payroll', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(39, 'Jobs', 'module', 'App/Job', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(40, 'Estimates', 'module', 'App/Estimate', '2025-06-19 10:43:25', '2025-06-19 10:43:25'),
(41, 'Allow user to view cost on estimates & jobs', 'additional', NULL, '2025-06-19 10:44:50', '2025-06-19 10:44:50'),
(42, 'Allow user to modify product and service pricing', 'additional', NULL, '2025-06-19 10:44:50', '2025-06-19 10:44:50'),
(43, 'Limit estimate & job visibility', 'worker_app_estimation', NULL, '2025-06-19 10:46:22', '2025-06-19 10:46:22'),
(44, 'Allow user to view Estimated Charges (Estimate tab) in field worker app', 'worker_app', NULL, '2025-06-19 10:46:22', '2025-06-19 10:46:22'),
(45, 'Allow user to modify own time logs in field worker app', 'worker_app', NULL, '2025-06-19 10:46:22', '2025-06-19 10:46:22'),
(46, 'Allow user to view customer details in field worker app', 'worker_app', NULL, '2025-06-19 10:46:22', '2025-06-19 10:46:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
