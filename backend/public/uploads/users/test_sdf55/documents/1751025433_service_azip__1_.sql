-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 27, 2025 at 11:30 AM
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
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `alias` varchar(255) NOT NULL,
  `address1` text DEFAULT NULL,
  `address2` text DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zipcode` varchar(255) DEFAULT NULL,
  `country_id` int(11) DEFAULT NULL,
  `primary_contact_first_name` varchar(255) DEFAULT NULL,
  `primary_contact_last_name` varchar(255) DEFAULT NULL,
  `secondary_contact_first_name` varchar(255) DEFAULT NULL,
  `secondary_contact_last_name` varchar(255) DEFAULT NULL,
  `business_number` varchar(255) DEFAULT NULL,
  `primary_number` varchar(255) DEFAULT NULL,
  `secondary_number` varchar(255) DEFAULT NULL,
  `primary_email` varchar(255) DEFAULT NULL,
  `secondary_email` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `slogan` text DEFAULT NULL,
  `active` int(1) NOT NULL DEFAULT 1 COMMENT '0 => no,1 => yes',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `user_id`, `name`, `slug`, `alias`, `address1`, `address2`, `city`, `state`, `zipcode`, `country_id`, `primary_contact_first_name`, `primary_contact_last_name`, `secondary_contact_first_name`, `secondary_contact_last_name`, `business_number`, `primary_number`, `secondary_number`, `primary_email`, `secondary_email`, `logo`, `slogan`, `active`, `created_at`, `updated_at`) VALUES
(6, '2', 'ARIZONA INTEGRITY PLUMBING', 'azip', 'AZIP', 'License 327261 | Residential and Commercial Licensed | Bonded | Insured', NULL, '14834 S 46th St Phoenix', 'AZ', '85044', 1, 'Alexandre', 'Ganev', NULL, NULL, NULL, '(480) 274-9662', '(808) 909-8080', 'info@azip.com', 'alex@azip.com', '1749540483_16366766331logosmaller.png', 'THE REPIPE EXPERT™', 1, '2025-05-30 02:25:40', '2025-06-23 02:53:49'),
(26, '1', 'INTNXT', 'intnxt', 'intnxt', 'New York', 'New York', 'New York', 'New York', '10001', 231, 'TMT', 'TMT', NULL, NULL, NULL, '(435) 435-3454', NULL, 'intnxt@gmail.com', NULL, '1749562221_jsbaidwan_sandyrarr.rushgmail.com_1748166012921_Create_a_captiv_015a38a3-1950-4d03-9215-d8f97f7c6f5a.webp', 'TMT', 1, '2025-06-10 05:36:01', '2025-06-11 00:40:44'),
(30, '1', 'Hey', 'hey', 'hey', 'New York', 'New York', 'New York', 'New York', '10001', 231, '4353', '345', '09', '890', '980', '(335) 345-3454', '(808) 909-8080', 'hey@gmail.com', 'hey1@azip.com', '1749554940_Gemini_Generated_Image_g0iqn4g0iqn4g0iq.png', 'hry', 1, '2025-06-10 05:59:00', '2025-06-11 01:33:48');

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`id`, `code`, `name`, `created_at`, `updated_at`) VALUES
(1, 'AF', 'Afghanistan', NULL, NULL),
(2, 'AL', 'Albania', NULL, NULL),
(3, 'DZ', 'Algeria', NULL, NULL),
(4, 'AS', 'American Samoa', NULL, NULL),
(5, 'AD', 'Andorra', NULL, NULL),
(6, 'AO', 'Angola', NULL, NULL),
(7, 'AI', 'Anguilla', NULL, NULL),
(8, 'AQ', 'Antarctica', NULL, NULL),
(9, 'AG', 'Antigua And Barbuda', NULL, NULL),
(10, 'AR', 'Argentina', NULL, NULL),
(11, 'AM', 'Armenia', NULL, NULL),
(12, 'AW', 'Aruba', NULL, NULL),
(13, 'AU', 'Australia', NULL, NULL),
(14, 'AT', 'Austria', NULL, NULL),
(15, 'AZ', 'Azerbaijan', NULL, NULL),
(16, 'BS', 'Bahamas The', NULL, NULL),
(17, 'BH', 'Bahrain', NULL, NULL),
(18, 'BD', 'Bangladesh', NULL, NULL),
(19, 'BB', 'Barbados', NULL, NULL),
(20, 'BY', 'Belarus', NULL, NULL),
(21, 'BE', 'Belgium', NULL, NULL),
(22, 'BZ', 'Belize', NULL, NULL),
(23, 'BJ', 'Benin', NULL, NULL),
(24, 'BM', 'Bermuda', NULL, NULL),
(25, 'BT', 'Bhutan', NULL, NULL),
(26, 'BO', 'Bolivia', NULL, NULL),
(27, 'BA', 'Bosnia and Herzegovina', NULL, NULL),
(28, 'BW', 'Botswana', NULL, NULL),
(29, 'BV', 'Bouvet Island', NULL, NULL),
(30, 'BR', 'Brazil', NULL, NULL),
(31, 'IO', 'British Indian Ocean Territory', NULL, NULL),
(32, 'BN', 'Brunei', NULL, NULL),
(33, 'BG', 'Bulgaria', NULL, NULL),
(34, 'BF', 'Burkina Faso', NULL, NULL),
(35, 'BI', 'Burundi', NULL, NULL),
(36, 'KH', 'Cambodia', NULL, NULL),
(37, 'CM', 'Cameroon', NULL, NULL),
(38, 'CA', 'Canada', NULL, NULL),
(39, 'CV', 'Cape Verde', NULL, NULL),
(40, 'KY', 'Cayman Islands', NULL, NULL),
(41, 'CF', 'Central African Republic', NULL, NULL),
(42, 'TD', 'Chad', NULL, NULL),
(43, 'CL', 'Chile', NULL, NULL),
(44, 'CN', 'China', NULL, NULL),
(45, 'CX', 'Christmas Island', NULL, NULL),
(46, 'CC', 'Cocos (Keeling) Islands', NULL, NULL),
(47, 'CO', 'Colombia', NULL, NULL),
(48, 'KM', 'Comoros', NULL, NULL),
(49, 'CG', 'Republic Of The Congo', NULL, NULL),
(50, 'CD', 'Democratic Republic Of The Congo', NULL, NULL),
(51, 'CK', 'Cook Islands', NULL, NULL),
(52, 'CR', 'Costa Rica', NULL, NULL),
(53, 'CI', 'Cote D\'Ivoire (Ivory Coast)', NULL, NULL),
(54, 'HR', 'Croatia (Hrvatska)', NULL, NULL),
(55, 'CU', 'Cuba', NULL, NULL),
(56, 'CY', 'Cyprus', NULL, NULL),
(57, 'CZ', 'Czech Republic', NULL, NULL),
(58, 'DK', 'Denmark', NULL, NULL),
(59, 'DJ', 'Djibouti', NULL, NULL),
(60, 'DM', 'Dominica', NULL, NULL),
(61, 'DO', 'Dominican Republic', NULL, NULL),
(62, 'TP', 'East Timor', NULL, NULL),
(63, 'EC', 'Ecuador', NULL, NULL),
(64, 'EG', 'Egypt', NULL, NULL),
(65, 'SV', 'El Salvador', NULL, NULL),
(66, 'GQ', 'Equatorial Guinea', NULL, NULL),
(67, 'ER', 'Eritrea', NULL, NULL),
(68, 'EE', 'Estonia', NULL, NULL),
(69, 'ET', 'Ethiopia', NULL, NULL),
(70, 'XA', 'External Territories of Australia', NULL, NULL),
(71, 'FK', 'Falkland Islands', NULL, NULL),
(72, 'FO', 'Faroe Islands', NULL, NULL),
(73, 'FJ', 'Fiji Islands', NULL, NULL),
(74, 'FI', 'Finland', NULL, NULL),
(75, 'FR', 'France', NULL, NULL),
(76, 'GF', 'French Guiana', NULL, NULL),
(77, 'PF', 'French Polynesia', NULL, NULL),
(78, 'TF', 'French Southern Territories', NULL, NULL),
(79, 'GA', 'Gabon', NULL, NULL),
(80, 'GM', 'Gambia The', NULL, NULL),
(81, 'GE', 'Georgia', NULL, NULL),
(82, 'DE', 'Germany', NULL, NULL),
(83, 'GH', 'Ghana', NULL, NULL),
(84, 'GI', 'Gibraltar', NULL, NULL),
(85, 'GR', 'Greece', NULL, NULL),
(86, 'GL', 'Greenland', NULL, NULL),
(87, 'GD', 'Grenada', NULL, NULL),
(88, 'GP', 'Guadeloupe', NULL, NULL),
(89, 'GU', 'Guam', NULL, NULL),
(90, 'GT', 'Guatemala', NULL, NULL),
(91, 'XU', 'Guernsey and Alderney', NULL, NULL),
(92, 'GN', 'Guinea', NULL, NULL),
(93, 'GW', 'Guinea-Bissau', NULL, NULL),
(94, 'GY', 'Guyana', NULL, NULL),
(95, 'HT', 'Haiti', NULL, NULL),
(96, 'HM', 'Heard and McDonald Islands', NULL, NULL),
(97, 'HN', 'Honduras', NULL, NULL),
(98, 'HK', 'Hong Kong S.A.R.', NULL, NULL),
(99, 'HU', 'Hungary', NULL, NULL),
(100, 'IS', 'Iceland', NULL, NULL),
(101, 'IN', 'India', NULL, NULL),
(102, 'ID', 'Indonesia', NULL, NULL),
(103, 'IR', 'Iran', NULL, NULL),
(104, 'IQ', 'Iraq', NULL, NULL),
(105, 'IE', 'Ireland', NULL, NULL),
(106, 'IL', 'Israel', NULL, NULL),
(107, 'IT', 'Italy', NULL, NULL),
(108, 'JM', 'Jamaica', NULL, NULL),
(109, 'JP', 'Japan', NULL, NULL),
(110, 'XJ', 'Jersey', NULL, NULL),
(111, 'JO', 'Jordan', NULL, NULL),
(112, 'KZ', 'Kazakhstan', NULL, NULL),
(113, 'KE', 'Kenya', NULL, NULL),
(114, 'KI', 'Kiribati', NULL, NULL),
(115, 'KP', 'Korea North', NULL, NULL),
(116, 'KR', 'Korea South', NULL, NULL),
(117, 'KW', 'Kuwait', NULL, NULL),
(118, 'KG', 'Kyrgyzstan', NULL, NULL),
(119, 'LA', 'Laos', NULL, NULL),
(120, 'LV', 'Latvia', NULL, NULL),
(121, 'LB', 'Lebanon', NULL, NULL),
(122, 'LS', 'Lesotho', NULL, NULL),
(123, 'LR', 'Liberia', NULL, NULL),
(124, 'LY', 'Libya', NULL, NULL),
(125, 'LI', 'Liechtenstein', NULL, NULL),
(126, 'LT', 'Lithuania', NULL, NULL),
(127, 'LU', 'Luxembourg', NULL, NULL),
(128, 'MO', 'Macau S.A.R.', NULL, NULL),
(129, 'MK', 'Macedonia', NULL, NULL),
(130, 'MG', 'Madagascar', NULL, NULL),
(131, 'MW', 'Malawi', NULL, NULL),
(132, 'MY', 'Malaysia', NULL, NULL),
(133, 'MV', 'Maldives', NULL, NULL),
(134, 'ML', 'Mali', NULL, NULL),
(135, 'MT', 'Malta', NULL, NULL),
(136, 'XM', 'Man (Isle of)', NULL, NULL),
(137, 'MH', 'Marshall Islands', NULL, NULL),
(138, 'MQ', 'Martinique', NULL, NULL),
(139, 'MR', 'Mauritania', NULL, NULL),
(140, 'MU', 'Mauritius', NULL, NULL),
(141, 'YT', 'Mayotte', NULL, NULL),
(142, 'MX', 'Mexico', NULL, NULL),
(143, 'FM', 'Micronesia', NULL, NULL),
(144, 'MD', 'Moldova', NULL, NULL),
(145, 'MC', 'Monaco', NULL, NULL),
(146, 'MN', 'Mongolia', NULL, NULL),
(147, 'MS', 'Montserrat', NULL, NULL),
(148, 'MA', 'Morocco', NULL, NULL),
(149, 'MZ', 'Mozambique', NULL, NULL),
(150, 'MM', 'Myanmar', NULL, NULL),
(151, 'NA', 'Namibia', NULL, NULL),
(152, 'NR', 'Nauru', NULL, NULL),
(153, 'NP', 'Nepal', NULL, NULL),
(154, 'AN', 'Netherlands Antilles', NULL, NULL),
(155, 'NL', 'Netherlands The', NULL, NULL),
(156, 'NC', 'New Caledonia', NULL, NULL),
(157, 'NZ', 'New Zealand', NULL, NULL),
(158, 'NI', 'Nicaragua', NULL, NULL),
(159, 'NE', 'Niger', NULL, NULL),
(160, 'NG', 'Nigeria', NULL, NULL),
(161, 'NU', 'Niue', NULL, NULL),
(162, 'NF', 'Norfolk Island', NULL, NULL),
(163, 'MP', 'Northern Mariana Islands', NULL, NULL),
(164, 'NO', 'Norway', NULL, NULL),
(165, 'OM', 'Oman', NULL, NULL),
(166, 'PK', 'Pakistan', NULL, NULL),
(167, 'PW', 'Palau', NULL, NULL),
(168, 'PS', 'Palestinian Territory Occupied', NULL, NULL),
(169, 'PA', 'Panama', NULL, NULL),
(170, 'PG', 'Papua new Guinea', NULL, NULL),
(171, 'PY', 'Paraguay', NULL, NULL),
(172, 'PE', 'Peru', NULL, NULL),
(173, 'PH', 'Philippines', NULL, NULL),
(174, 'PN', 'Pitcairn Island', NULL, NULL),
(175, 'PL', 'Poland', NULL, NULL),
(176, 'PT', 'Portugal', NULL, NULL),
(177, 'PR', 'Puerto Rico', NULL, NULL),
(178, 'QA', 'Qatar', NULL, NULL),
(179, 'RE', 'Reunion', NULL, NULL),
(180, 'RO', 'Romania', NULL, NULL),
(181, 'RU', 'Russia', NULL, NULL),
(182, 'RW', 'Rwanda', NULL, NULL),
(183, 'SH', 'Saint Helena', NULL, NULL),
(184, 'KN', 'Saint Kitts And Nevis', NULL, NULL),
(185, 'LC', 'Saint Lucia', NULL, NULL),
(186, 'PM', 'Saint Pierre and Miquelon', NULL, NULL),
(187, 'VC', 'Saint Vincent And The Grenadines', NULL, NULL),
(188, 'WS', 'Samoa', NULL, NULL),
(189, 'SM', 'San Marino', NULL, NULL),
(190, 'ST', 'Sao Tome and Principe', NULL, NULL),
(191, 'SA', 'Saudi Arabia', NULL, NULL),
(192, 'SN', 'Senegal', NULL, NULL),
(193, 'RS', 'Serbia', NULL, NULL),
(194, 'SC', 'Seychelles', NULL, NULL),
(195, 'SL', 'Sierra Leone', NULL, NULL),
(196, 'SG', 'Singapore', NULL, NULL),
(197, 'SK', 'Slovakia', NULL, NULL),
(198, 'SI', 'Slovenia', NULL, NULL),
(199, 'XG', 'Smaller Territories of the UK', NULL, NULL),
(200, 'SB', 'Solomon Islands', NULL, NULL),
(201, 'SO', 'Somalia', NULL, NULL),
(202, 'ZA', 'South Africa', NULL, NULL),
(203, 'GS', 'South Georgia', NULL, NULL),
(204, 'SS', 'South Sudan', NULL, NULL),
(205, 'ES', 'Spain', NULL, NULL),
(206, 'LK', 'Sri Lanka', NULL, NULL),
(207, 'SD', 'Sudan', NULL, NULL),
(208, 'SR', 'Suriname', NULL, NULL),
(209, 'SJ', 'Svalbard And Jan Mayen Islands', NULL, NULL),
(210, 'SZ', 'Swaziland', NULL, NULL),
(211, 'SE', 'Sweden', NULL, NULL),
(212, 'CH', 'Switzerland', NULL, NULL),
(213, 'SY', 'Syria', NULL, NULL),
(214, 'TW', 'Taiwan', NULL, NULL),
(215, 'TJ', 'Tajikistan', NULL, NULL),
(216, 'TZ', 'Tanzania', NULL, NULL),
(217, 'TH', 'Thailand', NULL, NULL),
(218, 'TG', 'Togo', NULL, NULL),
(219, 'TK', 'Tokelau', NULL, NULL),
(220, 'TO', 'Tonga', NULL, NULL),
(221, 'TT', 'Trinidad And Tobago', NULL, NULL),
(222, 'TN', 'Tunisia', NULL, NULL),
(223, 'TR', 'Turkey', NULL, NULL),
(224, 'TM', 'Turkmenistan', NULL, NULL),
(225, 'TC', 'Turks And Caicos Islands', NULL, NULL),
(226, 'TV', 'Tuvalu', NULL, NULL),
(227, 'UG', 'Uganda', NULL, NULL),
(228, 'UA', 'Ukraine', NULL, NULL),
(229, 'AE', 'United Arab Emirates', NULL, NULL),
(230, 'GB', 'United Kingdom', NULL, NULL),
(231, 'US', 'United States', NULL, NULL),
(232, 'UM', 'United States Minor Outlying Islands', NULL, NULL),
(233, 'UY', 'Uruguay', NULL, NULL),
(234, 'UZ', 'Uzbekistan', NULL, NULL),
(235, 'VU', 'Vanuatu', NULL, NULL),
(236, 'VA', 'Vatican City State (Holy See)', NULL, NULL),
(237, 'VE', 'Venezuela', NULL, NULL),
(238, 'VN', 'Vietnam', NULL, NULL),
(239, 'VG', 'Virgin Islands (British)', NULL, NULL),
(240, 'VI', 'Virgin Islands (US)', NULL, NULL),
(241, 'WF', 'Wallis And Futuna Islands', NULL, NULL),
(242, 'EH', 'Western Sahara', NULL, NULL),
(243, 'YE', 'Yemen', NULL, NULL),
(244, 'YU', 'Yugoslavia', NULL, NULL),
(245, 'ZM', 'Zambia', NULL, NULL),
(246, 'ZW', 'Zimbabwe', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0000_00_00_000000_create_websockets_statistics_entries_table', 1),
(2, '2014_10_12_000000_create_users_table', 1),
(3, '2014_10_12_100000_create_password_reset_tokens_table', 1),
(4, '2014_10_12_100000_create_password_resets_table', 1),
(5, '2016_06_01_000001_create_oauth_auth_codes_table', 1),
(6, '2016_06_01_000002_create_oauth_access_tokens_table', 1),
(7, '2016_06_01_000003_create_oauth_refresh_tokens_table', 1),
(8, '2016_06_01_000004_create_oauth_clients_table', 1),
(9, '2016_06_01_000005_create_oauth_personal_access_clients_table', 1),
(10, '2019_08_19_000000_create_failed_jobs_table', 1),
(11, '2019_12_14_000001_create_personal_access_tokens_table', 1),
(12, '2025_05_27_103632_create_roles_table', 2),
(13, '2020_12_25_053516_create_countries_table', 3),
(14, '2025_05_30_054351_create_companies_table', 4),
(15, '2025_06_19_093151_create_permissions_table', 5),
(16, '2025_06_25_092041_create_user_documents_table', 6);

-- --------------------------------------------------------

--
-- Table structure for table `oauth_access_tokens`
--

CREATE TABLE `oauth_access_tokens` (
  `id` varchar(100) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `scopes` text DEFAULT NULL,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `oauth_access_tokens`
--

INSERT INTO `oauth_access_tokens` (`id`, `user_id`, `client_id`, `name`, `scopes`, `revoked`, `created_at`, `updated_at`, `expires_at`) VALUES
('018792532018abb3f886d56dd16c85f7a353d7165c95c4cb1abeb63483ce37215b5f9710209dc1dc', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:55:49', '2025-06-06 03:55:49', '2025-06-06 09:35:49'),
('027dd97be9b83321a343ebbc63e813f373c07a87b6862428153899d8e92399ca68a48b3130164d6f', 1, 1, 'MyApp', '[]', 0, '2025-06-17 01:05:11', '2025-06-17 01:05:11', '2025-06-17 06:45:11'),
('02935e59f9a9af22521741442ad296bc2880b0693e725b370f79eb4d30467928826605fa4da5e03b', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:46:41', '2025-06-06 03:46:41', '2025-06-06 09:26:41'),
('02a210588b0394efdc1e025dd941d2cdcd936fc80f6f604068e056af6e881ead79f2020b4575d7d7', 21, 1, 'MyApp', '[]', 0, '2025-06-06 07:02:11', '2025-06-06 07:02:11', '2025-06-06 12:42:11'),
('03bea408954258883be4004687efcc348c242079b00609a248b50afd8f0f02734442db145fea9550', 21, 1, 'MyApp', '[]', 0, '2025-06-06 04:52:34', '2025-06-06 04:58:42', '2025-06-06 10:38:42'),
('03e2b9c2176e96a39829b2819c1fd6bf062439dfc5ab0cda65319c3ec9cacfc863d82c57b08ae749', 21, 1, 'MyApp', '[]', 0, '2025-06-06 07:08:29', '2025-06-06 07:08:29', '2025-06-06 12:48:29'),
('0426729c9b7755077201e6884b67f71048d1e199925ba0d1bcdc1b988fa17c24e7612b220ac94d25', 1, 1, 'MyApp', '[]', 0, '2025-06-20 00:31:41', '2025-06-20 00:34:04', '2025-06-20 06:14:04'),
('04a029fc93065688f00bd9a91e356dbfbc6beb873fe14cea19164cdf46258373cddfd3cf66631fb1', 21, 1, 'MyApp', '[]', 0, '2025-06-06 07:18:35', '2025-06-06 07:18:36', '2025-06-06 12:58:35'),
('0508e621a845fc595da485539e536448b3b0e550f50796782d2c11e88c67a43a9e48a59ad4ec40f1', 21, 1, 'MyApp', '[]', 0, '2025-06-09 00:16:38', '2025-06-09 00:19:58', '2025-06-09 05:59:58'),
('05498c61d2eeb15f3d719cb93dba73192f613893ef63c57a29b690d4c358b55c3866db028631bed9', 21, 1, 'MyApp', '[]', 0, '2025-06-20 01:48:46', '2025-06-20 03:07:35', '2025-06-20 08:47:35'),
('081bc17b0ecc3475f11fb48526f33e03763420bea03b8b1505fea10472b5680181158b459db3a51f', 1, 1, 'MyApp', '[]', 0, '2025-06-17 05:16:47', '2025-06-17 05:44:55', '2025-06-17 11:24:55'),
('0b3dc3c9a5d5a9922b71509b908d9228452672e8d141913e7b7fa8da60c948336017da579d571306', 21, 1, 'MyApp', '[]', 0, '2025-06-23 06:12:53', '2025-06-23 06:12:53', '2025-06-23 11:52:53'),
('0b8643901cf285c80b72841253505368ccb884fa4893286a7cbb59c05e7ea49d98fcf7bb96532c0f', 1, 1, 'MyApp', '[]', 0, '2025-06-27 02:06:58', '2025-06-27 03:01:16', '2025-06-27 08:41:16'),
('0c5d016b57388447c8710b74d28a2304ab091f8a4370d8b77661c293a6f43fd2ba3a70bdd64c858e', 1, 1, 'MyApp', '[]', 0, '2025-06-06 04:32:35', '2025-06-06 04:32:35', '2025-06-06 10:12:35'),
('0d4185807990887bdc5fcf99ecfd39c5efa119e2be0e7259240726b548d6f90c6ffda52596637790', 21, 1, 'MyApp', '[]', 0, '2025-06-06 04:37:34', '2025-06-06 04:37:34', '2025-06-06 10:17:34'),
('0f238b55609989260fb3af0158b688b0384d47119131e34aef91ee8c20326c8a6f1707feeaeec0ae', 21, 1, 'MyApp', '[]', 0, '2025-06-23 23:52:52', '2025-06-24 00:11:52', '2025-06-24 05:51:52'),
('107e626840b95afb4481973849d2239b4f9cf06487547a6ee7492ecb6f1712d7f4a3ac32d9c62f0e', 1, 1, 'MyApp', '[]', 0, '2025-06-09 06:10:26', '2025-06-09 06:10:26', '2025-06-09 11:50:26'),
('114fea927f66102567450320bb5f54ef35774895838921d3bb5bb11669268be49245bfd65f76f1f6', 21, 1, 'MyApp', '[]', 0, '2025-06-20 06:00:49', '2025-06-20 06:20:12', '2025-06-20 12:00:12'),
('14aba23d03e0423f162e4db400fc7162b01c6ecab5e39ab5f007e2b1849788f23788abb46592eeff', 1, 1, 'MyApp', '[]', 0, '2025-06-11 00:35:54', '2025-06-11 00:44:18', '2025-06-11 06:24:18'),
('14e02dd55e4f015b219f2952346d46628480bf7e28ae5dd552a30965b1e2a23aa577a40b6975ff68', 21, 1, 'MyApp', '[]', 0, '2025-06-13 04:13:35', '2025-06-13 04:13:58', '2025-06-13 09:53:58'),
('15df7622805ead5b14f0a38bf72f4e57977f963e83115aa1f83a809a03a3d2e37411e43a68bc7757', 1, 1, 'MyApp', '[]', 0, '2025-06-20 01:31:44', '2025-06-20 01:34:09', '2025-06-20 07:14:09'),
('1769f18398dc09c990cebd067a9e6e4923484babde4b0e8d62d724a75f9182e7505e5a539e033a57', 21, 1, 'MyApp', '[]', 0, '2025-06-06 07:07:38', '2025-06-06 07:07:38', '2025-06-06 12:47:38'),
('17a815f5693408e50db2b86b322e587330e4e900a690f2bc54f45893e659a5f65ba598e9866db1c9', 1, 1, 'MyApp', '[]', 0, '2025-06-19 00:10:04', '2025-06-19 00:22:37', '2025-06-19 06:02:37'),
('17fd4221f32b76280fcb236141bb151560f8d7809fa5083622bab921ebb9d3fa0d8aa948f5ae430e', 1, 1, 'MyApp', '[]', 0, '2025-06-19 05:21:38', '2025-06-19 05:21:38', '2025-06-19 11:01:38'),
('184c1f4b3537403196cca9fe9b5c04b3e3921f161bb1d79a4387a8847e70edda3167d5cfe17bcdf7', 21, 1, 'MyApp', '[]', 0, '2025-06-06 04:37:26', '2025-06-06 04:37:26', '2025-06-06 10:17:26'),
('18a904a62c2c048776f47657831d1ba48abedd9ffc13e1c87f24d9eef6fac6f62f85bcd872d68e3f', 1, 1, 'MyApp', '[]', 0, '2025-06-17 02:41:18', '2025-06-17 02:51:38', '2025-06-17 08:31:38'),
('18c5a41ecb722b059de62dd7ae74800b0bdc97a997aca4bf04f4f6e0694c751ce73fec62ca96e3e9', 21, 1, 'MyApp', '[]', 0, '2025-06-20 05:13:34', '2025-06-20 05:18:42', '2025-06-20 10:58:42'),
('195576968af97b827d5968cadc06c3447043e2f4256df847b5b02f23e8b4d977ffa7bca7faf6d632', 1, 1, 'MyApp', '[]', 0, '2025-06-09 06:54:08', '2025-06-09 06:55:03', '2025-06-09 12:35:03'),
('1a6e1acc764dbddd2b58d1ba8555d8d3d25b905e5704b6b619f2a94939570a0ecfe1224e3fbd43f2', 1, 1, 'MyApp', '[]', 0, '2025-06-17 03:51:23', '2025-06-17 03:58:44', '2025-06-17 09:38:44'),
('1a96e9581d3bfe95c2e5114469249d5beadcddba07978f222ba83392183288f22c5b3cffe4f9bafe', 22, 1, 'MyApp', '[]', 0, '2025-06-17 04:35:24', '2025-06-17 04:36:37', '2025-06-17 10:16:37'),
('1b73230ec38f4ed3b138f74ad371b2370a670bab6cb236601664e068c039eabe2f5acaeb2cb2581a', 22, 1, 'MyApp', '[]', 0, '2025-06-06 04:30:54', '2025-06-06 04:30:54', '2025-06-06 10:10:54'),
('1b997855e5dec92df323529a144eb2ee1df331c730d9576ffc7a07e895c14fb1706a39f5a6ce55be', 22, 1, 'MyApp', '[]', 0, '2025-06-06 04:12:08', '2025-06-06 04:12:08', '2025-06-06 09:52:08'),
('1dc4215a999384dcdf800828da07b1463bd2229fa2b8b25950470e712cda2393ca03b84f04f76e6d', 22, 1, 'MyApp', '[]', 0, '2025-06-06 02:59:00', '2025-06-06 02:59:01', '2025-06-06 08:39:00'),
('1e006f924b5a93c76a915b09c520705f3bdd4e89eff4ea6a8d95d0db350c71879bf00ccf8dae0e50', 1, 1, 'MyApp', '[]', 0, '2025-06-18 23:52:37', '2025-06-19 00:09:46', '2025-06-19 05:49:46'),
('1e55ecddabeaa842534b74b28be0a5c7a0c08f3aa32fa4fcf22dcc884bda5bb7fc375b64261a6ad7', 1, 1, 'MyApp', '[]', 0, '2025-06-25 07:33:05', '2025-06-25 07:50:27', '2025-06-25 13:30:27'),
('1efa84063a73e4e909e5a9fcf58e9721d3bc22b581f1f464d46e5aee67f3287c91191e1f79d7d042', 1, 1, 'MyApp', '[]', 0, '2025-06-24 03:56:14', '2025-06-24 03:56:14', '2025-06-24 09:36:14'),
('2209d3a5e8c73d8b6fbed312214e87c16f041806dc42fdd75900a87182466096e4321353498b7aec', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:58:18', '2025-06-06 03:58:18', '2025-06-06 09:38:18'),
('2293416a81b353d867c70ee6577cf2e7821d91cf072f59786e40a53e36f3fce32f07aa11bc1817b8', 1, 1, 'MyApp', '[]', 0, '2025-06-09 02:06:05', '2025-06-09 02:06:05', '2025-06-09 07:46:05'),
('239107454776675169f6b977b40b2fd086ee29c913193896dcf2f92791c957e669ea914f83acbb4e', 1, 1, 'MyApp', '[]', 0, '2025-06-09 07:21:36', '2025-06-09 07:26:36', '2025-06-09 13:06:36'),
('23b3451cd7b384c3a8ba394208ff3ae3dc8553c118e0ac690d09774ecf8bdf9850d35d134dfc37e3', 1, 1, 'MyApp', '[]', 0, '2025-06-17 00:51:26', '2025-06-17 00:54:44', '2025-06-17 06:34:44'),
('25e084ff1fd701a64cc6060f2241e610f5eb3ea07ee7bc779f093b0c0a4af74970d04801b6276fc8', 22, 1, 'MyApp', '[]', 0, '2025-06-27 04:00:16', '2025-06-27 04:00:24', '2025-06-27 09:40:24'),
('26dd8c486386a2576ab14c165bb49f09fc66efee2cc567ca5e167412bcbb2aec78cf51f9d52b9b5d', 1, 1, 'MyApp', '[]', 0, '2025-06-18 03:46:02', '2025-06-18 05:45:31', '2025-06-18 11:25:31'),
('27521f82b08537fd5265b0e7ade75e6bed53e378f3632d64d6e96446850a819d5f2302dc5dbcf6d1', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:42:08', '2025-06-06 03:42:08', '2025-06-06 09:22:08'),
('293a96e895303e554d379c0d1ee7f5270864343653f6b015fc5296bee914872a255f921654874aa0', 1, 1, 'MyApp', '[]', 0, '2025-06-17 07:50:37', '2025-06-17 07:52:32', '2025-06-17 13:32:32'),
('294d88101502ac2f1b8edde6b832721a1cba502fb19b5fadec58eeab1de60a03e5114f49d99ac8fc', 1, 1, 'MyApp', '[]', 0, '2025-06-17 07:59:41', '2025-06-17 08:01:39', '2025-06-17 13:41:39'),
('2ca6658ffa0509fae3330f9ae1356290ba75bdde561e649ba739f2a2159f13743a2fba09611da9c5', 1, 1, 'MyApp', '[]', 0, '2025-06-09 06:47:57', '2025-06-09 06:52:09', '2025-06-09 12:32:09'),
('2f48e528954b149e7ebe4c3d4560677bfae8f3e478834903fe38509a82448b18ddebf80d6dbda6cb', 1, 1, 'MyApp', '[]', 0, '2025-06-09 01:30:41', '2025-06-09 01:30:41', '2025-06-09 07:10:41'),
('311bfe8b492453c81a8240e42dba3376597c400ba651c4a43812b5355a40d1892109a30ae5f7f835', 1, 1, 'MyApp', '[]', 0, '2025-06-10 23:56:14', '2025-06-10 23:56:18', '2025-06-11 05:36:18'),
('316f978876243c74c3e73579e02ebb3cf7e5305959458f1a19972e8025a8cc1d13fe9920ad60c43f', 1, 1, 'MyApp', '[]', 0, '2025-06-18 02:19:24', '2025-06-18 03:07:53', '2025-06-18 08:47:53'),
('31b0b75664a1c4c745bdc4dbd0fcf1d1fbe04bb202fdf63eb524842317b2cf36f8faa9cc7402293a', 21, 1, 'MyApp', '[]', 0, '2025-06-12 05:43:15', '2025-06-12 05:43:16', '2025-06-12 11:23:16'),
('330c3b4546216650725f1801c4331344a01dc2b9179c2f8ec1a31022dbbc1cb0636ae2c591f50ecb', 21, 1, 'MyApp', '[]', 0, '2025-06-06 01:03:27', '2025-06-06 01:03:28', '2025-06-06 06:43:27'),
('33df12cbe7f664c16480c7c59d85f56b8ceefc273b61ac4177c7f9dc51ec001755450f9e5b42b1ec', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:45:11', '2025-06-06 03:45:11', '2025-06-06 09:25:11'),
('34118d2a61e541286b78fea32f90825d05479b6157e71c2cbbbc26c038c2a9c716cd41afaa028996', 1, 1, 'MyApp', '[]', 0, '2025-06-09 07:54:34', '2025-06-09 08:01:05', '2025-06-09 13:41:05'),
('3436025f55eeea4c5cd96b735321692c280ab23c157d80afada20cbc0a3191c5c912491a2543504d', 1, 1, 'MyApp', '[]', 0, '2025-06-26 05:31:46', '2025-06-26 05:32:23', '2025-06-26 11:12:23'),
('35c6082a26ca741da8720ae92420da345d3ef7f5ecffb192ca4f2496eda4cbc5d47d7186bd614e66', 21, 1, 'MyApp', '[]', 0, '2025-06-23 07:34:06', '2025-06-23 07:34:06', '2025-06-23 13:14:06'),
('35dd6b7bdff2dc5a9ccb0dcbb358a9f61185c273c991f2993234df402e6fb6427aa98880498fe92e', 1, 1, 'MyApp', '[]', 0, '2025-06-19 01:20:28', '2025-06-19 01:21:33', '2025-06-19 07:01:33'),
('36d1b6614ce2e6f7ba314e90f7da929a91844840333571faf92756deb5334e09f57cb49c459bd982', 35, 1, 'MyApp', '[]', 0, '2025-06-27 02:08:39', '2025-06-27 02:08:39', '2025-06-27 07:48:39'),
('37151bd7b50410029864a04c9c31274ce2661ae5f3b8a021b8bc503ec1dcfced345747b2c4e99a43', 21, 1, 'MyApp', '[]', 0, '2025-06-22 23:44:52', '2025-06-22 23:44:53', '2025-06-23 05:24:52'),
('37192d7630a40cbeb4636fb7ab9f961e05d086c9b4842c8c80e4231b0c0c1f912e0d176675b3e865', 21, 1, 'MyApp', '[]', 0, '2025-06-12 05:42:36', '2025-06-12 05:42:39', '2025-06-12 11:22:39'),
('38d1ffdf7c5e6391fc0a9c8dcebaf667fef28b37185c9e523f0c16152c436040066dbbf75e1b9b04', 22, 1, 'MyApp', '[]', 0, '2025-06-05 07:17:57', '2025-06-05 07:17:57', '2025-06-05 12:57:57'),
('3ac7bc9f8ccfec7e28397c2993a310275a23235ea425a5bf609ec888e87f6e3f0402987af182ee86', 21, 1, 'MyApp', '[]', 0, '2025-06-06 07:29:59', '2025-06-06 07:30:27', '2025-06-06 13:10:27'),
('3ae2154107d08609fda7a5978345e3d3282d3a90b5bc6dbc222f96906a97a560baf3e9e82a3a5977', 1, 1, 'MyApp', '[]', 0, '2025-06-09 06:18:02', '2025-06-09 06:47:34', '2025-06-09 12:27:34'),
('3b6ccc8688782b99343078b98487cf83991ca48c89a11958eb6b9027936fb970af26b82b967f911c', 1, 1, 'MyApp', '[]', 0, '2025-06-09 06:04:24', '2025-06-09 06:04:26', '2025-06-09 11:44:26'),
('3d432015b421523693aa5c606b1e96e76d2fddfbc16c14cffb3c13c34e586b888e825f8de5e9e031', 21, 1, 'MyApp', '[]', 0, '2025-06-06 07:20:46', '2025-06-06 07:21:05', '2025-06-06 13:01:05'),
('3db509922eedbf21bb64483db5121f40ea2fb5a2377e4e6cbb7d5e18155ace61e1a02c2f1b28ceea', 1, 1, 'MyApp', '[]', 0, '2025-06-22 23:45:11', '2025-06-23 00:01:17', '2025-06-23 05:41:17'),
('3ed3d2501cc058791c5845d71d728a16c801b93da3396805241cd31b4ec06d82216ed91a02a9ecc1', 1, 1, 'MyApp', '[]', 0, '2025-06-20 00:40:13', '2025-06-20 01:21:30', '2025-06-20 07:01:30'),
('3f7a18d89918d92406d354694c34d222b6cd3eb762c5024474d47e29d5ef242c93a3bbbb88eb57c1', 1, 1, 'MyApp', '[]', 0, '2025-06-16 04:11:06', '2025-06-16 04:13:27', '2025-06-16 09:53:27'),
('40cb12c35474ff0c3db4f1c58c38e984063668a1409883be92e50149b4a983d41dcadd245b84b388', 21, 1, 'MyApp', '[]', 0, '2025-06-20 00:40:54', '2025-06-20 01:05:44', '2025-06-20 06:45:44'),
('41b8e272f65393e52670936dbe2b62292b35e0e5ef096cfec03c4d6a2837e9f6466710fd2d262cf7', 1, 1, 'MyApp', '[]', 0, '2025-06-09 07:26:45', '2025-06-09 07:54:28', '2025-06-09 13:34:28'),
('43f77d4671ab11f55797230747846a448ecbf263aabf6bf74d3d9ca2f9a189bd63b4345223e67862', 21, 1, 'MyApp', '[]', 0, '2025-06-13 05:27:03', '2025-06-13 05:27:09', '2025-06-13 11:07:09'),
('4680376b39793e6ca12d8217b51242cf4e281513e5d06ae0f750992795aa16cac73ee027f8b9beae', 22, 1, 'MyApp', '[]', 0, '2025-06-17 04:47:29', '2025-06-17 04:47:29', '2025-06-17 10:27:29'),
('4939eac022521d0ea5b0ca17c9c01a266ee9324dab348f076768b956277f8caa530dbe3df676b76b', 1, 1, 'MyApp', '[]', 0, '2025-06-06 04:35:21', '2025-06-06 04:35:21', '2025-06-06 10:15:21'),
('49636c7a9ec9883161aad8a60008c6bb3297c0f0b6fb04f8b2574471c0ace2e09f5002678c613285', 1, 1, 'MyApp', '[]', 0, '2025-06-17 07:52:34', '2025-06-17 07:59:40', '2025-06-17 13:39:40'),
('49b008e0fe1214eefab6414ffdde6cc4af2a5f2cdf827f3c94aeffe213fc2adab01fbcb50c512a9f', 21, 1, 'MyApp', '[]', 0, '2025-06-24 00:11:57', '2025-06-24 00:11:57', '2025-06-24 05:51:57'),
('49ea4a1c29ce6d37c9101a3307b523a8edec79ef40076aa2c6e213ab56ff188fdc3705acaa434740', 1, 1, 'MyApp', '[]', 0, '2025-06-19 01:21:38', '2025-06-19 03:06:41', '2025-06-19 08:46:41'),
('49f641fcacb67a69e57f34dd72ae83edf419a2d0087f7879219ce789dae30934910e4a51793f6a76', 21, 1, 'MyApp', '[]', 0, '2025-06-13 05:16:16', '2025-06-13 05:16:16', '2025-06-13 10:56:16'),
('4ce771dde68cb9a400dfa948a7828d26a04a5eee2669d5d0a0df451f9ce0353fbefdf1c5e41a879b', 1, 1, 'MyApp', '[]', 0, '2025-06-12 04:00:38', '2025-06-12 04:00:40', '2025-06-12 09:40:40'),
('50347f48f7146ce005c7f2ba49f977902fc49ceceb6b8cbe1ccd02ee0d703353fe0fbc26950bd5ad', 1, 1, 'MyApp', '[]', 0, '2025-06-10 07:19:48', '2025-06-10 07:20:00', '2025-06-10 13:00:00'),
('55d427030b9268d9806019487151fe128e9beb5534231cf3e51dd5b966ec508fb367f50a3c415855', 21, 1, 'MyApp', '[]', 0, '2025-06-23 03:00:09', '2025-06-23 03:00:16', '2025-06-23 08:40:16'),
('570a1c63401913d8039d15c47a6068978f05a127ba62d83eb1892f30da6bcdebca8e79d33f316c18', 1, 1, 'MyApp', '[]', 0, '2025-06-10 05:03:32', '2025-06-10 06:12:03', '2025-06-10 11:52:03'),
('587805554b6a7009806f222577e67df9f2419c37a600b3d935ad0de1543ab426c8d69e4029b40c79', 22, 1, 'MyApp', '[]', 0, '2025-06-06 04:14:32', '2025-06-06 04:14:32', '2025-06-06 09:54:32'),
('5978fea2ff4435345b556735212273abe8378595c8274421a61244d8e8589893304b4bbe7e9e8aca', 1, 1, 'MyApp', '[]', 0, '2025-06-19 04:40:13', '2025-06-19 04:57:20', '2025-06-19 10:37:20'),
('5b38b4fb4cbf99b4703dfe1bcf81c386f286a0d6d6e1edbaa1d0427e2328c8297477e263943b7164', 22, 1, 'MyApp', '[]', 0, '2025-06-06 02:57:09', '2025-06-06 02:57:10', '2025-06-06 08:37:09'),
('5d3af1545dd1ad8cdbdd6f9da57f15da9e0afbf3e9c978e1d448ef0964b6870ae96b42d7709a8fe7', 1, 1, 'MyApp', '[]', 0, '2025-06-19 03:06:55', '2025-06-19 03:08:06', '2025-06-19 08:48:06'),
('5d734b6057cca5bdf73f335e6a92516c8ba4a43522a93d34c781ef286a9ca9ebed42358e62f88d0e', 1, 1, 'MyApp', '[]', 0, '2025-06-26 23:50:04', '2025-06-27 00:14:38', '2025-06-27 05:54:38'),
('5e490ad5cedfb007924b78c2def383061c18769db3e137c98680452caeb7e04d96b7133deb54ec5f', 1, 1, 'MyApp', '[]', 0, '2025-06-25 00:04:01', '2025-06-25 02:13:33', '2025-06-25 07:53:33'),
('5e7b2658712939369f0af53edc3b0dac32bb7b34078383be855c50621bd7e6fc4960ded5cf065d72', 1, 1, 'MyApp', '[]', 0, '2025-06-10 05:03:03', '2025-06-10 05:03:07', '2025-06-10 10:43:07'),
('61fee4e032c1580287ad46144fb50e4ff15f83ae7d358b1efd1136b796c8efbb6d621d049745568f', 1, 1, 'MyApp', '[]', 0, '2025-06-19 23:54:36', '2025-06-20 00:02:17', '2025-06-20 05:42:17'),
('62b0f6ab2d611c6601feeab5abb7e95892f13569e0004bb130d4096bafc4a78f821b8ba406d1d6a1', 1, 1, 'MyApp', '[]', 0, '2025-06-09 02:09:24', '2025-06-09 02:09:24', '2025-06-09 07:49:24'),
('6467b7da5f243dc785265c947d61e46e99547ca579d6bcc4934fe86f01650db7ea30493076c46c96', 1, 1, 'MyApp', '[]', 0, '2025-06-09 05:00:36', '2025-06-09 05:00:36', '2025-06-09 10:40:36'),
('663a0e3fbc38fb1c615486fc86645efdbed19aa53b46e7933725ed2617d68feaec1cff1043360a7f', 1, 1, 'MyApp', '[]', 0, '2025-06-17 07:48:39', '2025-06-17 07:50:35', '2025-06-17 13:30:35'),
('67f606f13b8366349ee0c193db385f073d63e4acde64c77b2a39d607b6862539fbdd77ed508a7908', 1, 1, 'MyApp', '[]', 0, '2025-06-09 06:53:52', '2025-06-09 06:53:56', '2025-06-09 12:33:56'),
('6802ba9d6b35faa6c807d3cb682730b6bdab5ddd59e2a87ef90109038d0fab8c46019f7279ab2460', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:43:11', '2025-06-06 03:43:11', '2025-06-06 09:23:11'),
('68ad6ea6e4ff51251e171a9511709c66dc0da8557fdb303dfe2709a9903f0f520d15c9a2aa64cd7d', 21, 1, 'MyApp', '[]', 0, '2025-06-06 06:25:25', '2025-06-06 06:25:26', '2025-06-06 12:05:25'),
('6923fe44012037b32b6dccebbc9121e993f6fc4705712727efd401caf5d96169e742ce748b634a7c', 1, 1, 'MyApp', '[]', 0, '2025-06-24 03:50:47', '2025-06-24 03:51:45', '2025-06-24 09:31:45'),
('6b42bb7631d40be3f65538beee3e9bd6ebcd572804129a6328af994734929470cc13e234206dcc9d', 21, 1, 'MyApp', '[]', 0, '2025-06-24 08:00:15', '2025-06-24 08:01:06', '2025-06-24 13:41:06'),
('6b7fb5ed5dbfd67a12c9941684d31bb348ba9f07a22ea205555d482fb352b9ebc28b47b0492825f0', 21, 1, 'MyApp', '[]', 0, '2025-06-25 07:04:00', '2025-06-25 07:06:01', '2025-06-25 12:46:01'),
('6b8a169696ef4beb91abb0e3cb25c39b50f3434aa716fb15ca0cee4b81ba1fc7fbae9b2d83294540', 21, 1, 'MyApp', '[]', 0, '2025-06-25 01:30:13', '2025-06-25 01:42:24', '2025-06-25 07:22:24'),
('6bf53e31a4329e01dd350100ff93008cf2b94b52b5f93b8f7e1da7de5d7c5a372c706eb2cd6e9dd8', 21, 1, 'MyApp', '[]', 0, '2025-06-23 06:12:43', '2025-06-23 06:12:43', '2025-06-23 11:52:43'),
('6cc99cd32d215ea22492f97755cc9aa0ac9d963a5125a4860a681c3e83e39f05412999a649fa9cc6', 1, 1, 'MyApp', '[]', 0, '2025-06-06 01:17:51', '2025-06-06 01:17:51', '2025-06-06 06:57:51'),
('6dbbe9f79f27c721fafa5eea8492ee50db31884137a5421390e2eff634e1dc2292fe77d8c7e50880', 1, 1, 'MyApp', '[]', 0, '2025-06-23 04:03:38', '2025-06-23 04:04:03', '2025-06-23 09:44:03'),
('6e2f01fc22470cda266f2f6dd5ed646ce9df9745503647f8e58e2407c131237b3c693f81c885afdf', 22, 1, 'MyApp', '[]', 0, '2025-06-06 02:03:35', '2025-06-06 02:03:35', '2025-06-06 07:43:35'),
('70d2ce104845bed14b8f6244dac9a94ab55c12be47d314a99847b1ff64c6331ec7324c6338e414e7', 1, 1, 'MyApp', '[]', 0, '2025-06-09 23:52:35', '2025-06-10 00:20:52', '2025-06-10 06:00:52'),
('71214707a5a1cbcdbe9ef5b845bde4b31c78e1f1c4bd06a4cff6fd303acedccf0715feac483e25b9', 21, 1, 'MyApp', '[]', 0, '2025-06-24 07:29:04', '2025-06-24 07:29:04', '2025-06-24 13:09:04'),
('719f6eb6d89a74f4916a1ee9451225967927e7c8fd4c19dfb1d1e9072fce209a74961d26303c0033', 1, 1, 'MyApp', '[]', 0, '2025-06-10 04:38:02', '2025-06-10 04:58:03', '2025-06-10 10:38:03'),
('71e3b923bc8e376695be56ee82337f5f2ac10d4a12df4ca430eecc84c19b1a5101e20ba4245e7a44', 21, 1, 'MyApp', '[]', 0, '2025-06-27 03:56:35', '2025-06-27 03:56:35', '2025-06-27 09:36:35'),
('7205f445f8d4b2e33c6b66760285c9e465661f4855f193507a3d897e1068fc164b2206bf064be818', 1, 1, 'MyApp', '[]', 0, '2025-06-24 01:35:57', '2025-06-24 03:02:19', '2025-06-24 08:42:19'),
('7222eaba3d4a6a158c7be2e69f76bdda344c8d2144a34c1792fbbf878c38e233ad5549dc46b6f897', 1, 1, 'MyApp', '[]', 0, '2025-06-09 05:00:09', '2025-06-09 05:00:09', '2025-06-09 10:40:09'),
('741c4625b10d4626ac24e9b21fbcd33496bd555243c7b36d37394ebf45759bdd94ee0106955f896e', 22, 1, 'MyApp', '[]', 0, '2025-06-06 02:47:30', '2025-06-06 02:47:30', '2025-06-06 08:27:30'),
('74a2796efcf977feb620b278cd3d5cede5733353f813a3f163a51b1833b078b37d775b405597ddc7', 1, 1, 'MyApp', '[]', 0, '2025-06-16 04:33:49', '2025-06-16 04:44:18', '2025-06-16 10:24:18'),
('750f443fa2265a46bf727ea8bdf8e985aab98ab5069eea3a013079d24703402224f23c0656ede680', 1, 1, 'MyApp', '[]', 0, '2025-06-12 05:35:41', '2025-06-12 05:35:58', '2025-06-12 11:15:58'),
('757301bec156edea8adff6b8cb6f8ccad8e4ee35242866c64ad500bc6dd39e559c2d95a0d7ad828a', 1, 1, 'MyApp', '[]', 0, '2025-06-12 00:14:23', '2025-06-12 00:14:43', '2025-06-12 05:54:43'),
('75a0e3290ed172e5f88459b7c38864d76e1bda51cc122b0a747793b19824779f49404aa1de393660', 1, 1, 'MyApp', '[]', 0, '2025-06-09 04:57:02', '2025-06-09 04:57:02', '2025-06-09 10:37:02'),
('760c1bf93aaa780836df1e8aa85c8980951183db40ffcfb6437f3f84c0d0371b4a1d332869962027', 39, 1, 'MyApp', '[]', 0, '2025-06-27 02:39:40', '2025-06-27 02:39:49', '2025-06-27 08:19:49'),
('76e853ee1f5e5036a4e29ce0ec4b0f7bfd698fd6dcd834301370bd1835db8605cd34e45903b09119', 1, 1, 'MyApp', '[]', 0, '2025-06-19 04:17:00', '2025-06-19 04:22:38', '2025-06-19 10:02:38'),
('770e882120bdfd4b93d45f510d28a15890610aa8f68656fac1fafadd81e7d5168292bb751049af6d', 1, 1, 'MyApp', '[]', 0, '2025-06-18 00:16:30', '2025-06-18 02:19:36', '2025-06-18 07:59:36'),
('779083d0494296b2333aa802a5ec22cf5420320b97d4797d405a28f2dc98f3cbf8b82268818c418e', 21, 1, 'MyApp', '[]', 0, '2025-06-06 07:00:05', '2025-06-06 07:00:05', '2025-06-06 12:40:05'),
('77b74cc78759222c22577683caf509b571aeee9e8b0e4c91ee04f9d46a10f80ea8c736d21a4ff29b', 22, 1, 'MyApp', '[]', 0, '2025-06-06 02:59:32', '2025-06-06 02:59:32', '2025-06-06 08:39:32'),
('780a9f8d897e240d0efba32c48ce52f31ded1285f297884b7ef06659b34d40ddd35c903bbd788916', 1, 1, 'MyApp', '[]', 0, '2025-06-09 00:32:01', '2025-06-09 00:32:02', '2025-06-09 06:12:01'),
('7887a8ef1b45c93ee6cd970f24cae7a32803341fc3bdb51515c59535c775d916173025e95214fbf2', 1, 1, 'MyApp', '[]', 0, '2025-06-06 04:29:51', '2025-06-06 04:29:51', '2025-06-06 10:09:51'),
('79428f31d4137fecba77bac474b4955d7eaad3328bb519fc994268138217f4e81b0fdff4ddccffde', 1, 1, 'MyApp', '[]', 0, '2025-06-16 02:38:10', '2025-06-16 03:08:00', '2025-06-16 08:48:00'),
('7a164a11027f98532356255b0e0d3922ec3071bc8d4e99354218a66d201e52be30a845351cbd3876', 1, 1, 'MyApp', '[]', 0, '2025-06-26 04:51:12', '2025-06-26 05:31:31', '2025-06-26 11:11:31'),
('7ad21d82cb77336a43ba109d76bd1fe938a36bb0bf826f71c8be227c51201329f8a76cb6228a6d82', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:57:32', '2025-06-06 03:57:32', '2025-06-06 09:37:32'),
('7bdde372178b18c77815d4fdee7f80d0769d39c3ef6ff223944fcb62140f53fb29ff34e6c18c97ca', 1, 1, 'MyApp', '[]', 0, '2025-06-09 05:01:47', '2025-06-09 05:03:17', '2025-06-09 10:43:17'),
('7cf6d8e78c04da72a974101669ba3166bc8c6200fda3775ef41049342f0cc28fef183e1902684605', 21, 1, 'MyApp', '[]', 0, '2025-06-25 01:42:31', '2025-06-25 01:42:43', '2025-06-25 07:22:43'),
('7dd3ee569036b1dad3f09ad151a6692380947cc3724eb817a6ad6bdfc4fd389891e2629840e59d6f', 1, 1, 'MyApp', '[]', 0, '2025-06-27 00:14:44', '2025-06-27 01:21:10', '2025-06-27 07:01:10'),
('7e03fe6781630d1c255519d47313573a7082907658aecc6ccc5dc41767230d6b86370eec9ba5a999', 1, 1, 'MyApp', '[]', 0, '2025-06-13 04:59:45', '2025-06-13 04:59:47', '2025-06-13 10:39:47'),
('7e0c56e5b5c3de264cfd33601e27f136e041dcb1593f3f95da626fdadc99cd02cf28860d3fdffcc2', 21, 1, 'MyApp', '[]', 0, '2025-06-24 07:33:31', '2025-06-24 07:33:31', '2025-06-24 13:13:31'),
('7f537f5541614220cab8a2048219d387cb00e517173293433f3c7b890de0a074d686d29a8d6b44fc', 1, 1, 'MyApp', '[]', 0, '2025-06-09 05:58:02', '2025-06-09 06:01:16', '2025-06-09 11:41:16'),
('811c7da9f4be2fc46e4660e07254a591527935d7a89fc99a79a1cdc07d1d51ab40127f022e6871b8', 1, 1, 'MyApp', '[]', 0, '2025-06-10 02:18:54', '2025-06-10 03:05:10', '2025-06-10 08:45:10'),
('817cf7797d4521cf6a33957128715444259fbaa7ebc7a325cf403932d1991f20f2705d08834308a9', 21, 1, 'MyApp', '[]', 0, '2025-06-13 04:15:09', '2025-06-13 04:15:10', '2025-06-13 09:55:10'),
('8227712de6093a963a8a2c3b0923426ba8b9b8444a5093ecdbbc23885592be378752efa5d3885736', 1, 1, 'MyApp', '[]', 0, '2025-06-19 00:22:40', '2025-06-19 01:20:23', '2025-06-19 07:00:23'),
('8280640d711be74374d5f18058aeaac37c9528d2739d1b5ea4d80db8bb96bfb410f2a4a190f88468', 22, 1, 'MyApp', '[]', 0, '2025-06-13 05:55:02', '2025-06-13 05:55:21', '2025-06-13 11:35:21'),
('8433f772a2b53c5a9dec01fdb16bb7b8b1f2e3314b8cdf53bcedce950d37b8ac18af4edd4e6f740e', 1, 1, 'MyApp', '[]', 0, '2025-06-16 03:46:14', '2025-06-16 04:20:46', '2025-06-16 10:00:46'),
('84875306f230d09f6eaa39ee10600e71beb1524fcb3c1cd2ff7421d746c4d88e9328073b35809e42', 1, 1, 'MyApp', '[]', 0, '2025-06-17 05:44:57', '2025-06-17 05:53:54', '2025-06-17 11:33:54'),
('8672d3a8342fca645b69e6c00f72ef8bbb92014503dc57b24faa6df836e2bf229f23b1f02371092f', 21, 1, 'MyApp', '[]', 0, '2025-06-19 04:23:16', '2025-06-19 04:24:16', '2025-06-19 10:04:16'),
('8720ea500233df5456999629e2e46f90fac536e80c1a0cbe922aafffdd99d26790b57cc334619e63', 1, 1, 'MyApp', '[]', 0, '2025-06-16 07:51:57', '2025-06-16 07:59:06', '2025-06-16 13:39:06'),
('885670110d7b154cf6d616121e069ee7bb7b31b0428da923b992a440bc8310907e6a6d2e87333fe3', 21, 1, 'MyApp', '[]', 0, '2025-06-25 02:49:37', '2025-06-25 02:54:33', '2025-06-25 08:34:33'),
('88b0ba355ff05b9745f4f86e294753824fb36d6e9e89bd6991149567865018dbc068c346c86a4784', 1, 1, 'MyApp', '[]', 0, '2025-06-18 05:45:15', '2025-06-18 07:58:27', '2025-06-18 13:38:27'),
('88b219cc7204ca11af122f48de8e05a88d46cef7fcff0a2285a6ec658a0b178526bbdb6090ba7876', 1, 1, 'MyApp', '[]', 0, '2025-06-27 03:55:36', '2025-06-27 03:55:36', '2025-06-27 09:35:36'),
('88e57f8c34cbe6cc0f13dba314db4a5c60a5cf45a98c0f4a017184628cf720b84f2b9392b962e049', 1, 1, 'MyApp', '[]', 0, '2025-06-09 02:03:19', '2025-06-09 02:03:19', '2025-06-09 07:43:19'),
('895f9e8b2d3f621e4c1d85014029b0f57017081f4b3043ba142a39ec95e6cd92dffddba62bac8f6c', 22, 1, 'MyApp', '[]', 0, '2025-06-06 02:17:12', '2025-06-06 02:17:37', '2025-06-06 07:57:37'),
('8ad409b4456be8e1c33bb081b3455ce617855449c32f3a9e388051e0e6b425666a966ac4dad86ada', 21, 1, 'MyApp', '[]', 0, '2025-06-24 03:52:34', '2025-06-24 03:52:34', '2025-06-24 09:32:34'),
('8b008b59ed6b903dbc32b1287f70e7aa302ed6573a93a87ce0a8445eaf4eec9811cf289c3062a522', 1, 1, 'MyApp', '[]', 0, '2025-06-16 04:44:24', '2025-06-16 06:02:20', '2025-06-16 11:42:20'),
('8e6fcc773e47c79b61ffcfae90323978731fd391024e9b9ef83782128975b94a8d6a0f89d51ab1bf', 1, 1, 'MyApp', '[]', 0, '2025-06-24 08:01:53', '2025-06-24 08:02:22', '2025-06-24 13:42:22'),
('8ebab82d47ce5d1c4b96389300f586151da205785d6bc63d8afe9c7dd0f0b5ba804dc08d9017d59b', 1, 1, 'MyApp', '[]', 0, '2025-06-17 05:53:56', '2025-06-17 07:48:36', '2025-06-17 13:28:36'),
('9029325d0318d101e86efbb5261b73b8c3467f6499255f974ae770c7ecf89af1cfce381a7512ce44', 21, 1, 'MyApp', '[]', 0, '2025-06-20 01:05:55', '2025-06-20 01:34:33', '2025-06-20 07:14:33'),
('90c5f1288e986c187c66a947c8073d4cee1972c8a5118d642e23b7db7e84fbb535a876378e558017', 21, 1, 'MyApp', '[]', 0, '2025-06-06 06:52:18', '2025-06-06 06:52:18', '2025-06-06 12:32:18'),
('915b19f75c02228b0527fc2dccd2fda7a9dfa557f50f153185d3ff7b248de640613e835b563613e4', 1, 1, 'MyApp', '[]', 0, '2025-06-09 02:07:26', '2025-06-09 02:07:26', '2025-06-09 07:47:26'),
('91b33decee229df55bc4470dfb43c97f4a43afe2fe412cf69d9201d190321d80610ef8c23525608e', 1, 1, 'MyApp', '[]', 0, '2025-06-09 02:08:06', '2025-06-09 02:08:06', '2025-06-09 07:48:06'),
('9218a3429ad91046daed77f45b6aa1e07d64254235057615cba23bbc51e552cecc1b1183f910d9d6', 21, 1, 'MyApp', '[]', 0, '2025-06-25 03:04:30', '2025-06-25 03:06:36', '2025-06-25 08:46:36'),
('921be1c97c05087e64f235bfb9c9eb5ef8cbb7e6c9faead693a9ed2b9bf46582fb7fb90676eba8a5', 1, 1, 'MyApp', '[]', 0, '2025-06-27 01:33:58', '2025-06-27 02:04:43', '2025-06-27 07:44:43'),
('9291dae413d2572909725e5884b5b25f17d8a569dbec2766c503f7c27f8b69419330a265f1d64b17', 1, 1, 'MyApp', '[]', 0, '2025-06-23 00:01:42', '2025-06-23 00:14:53', '2025-06-23 05:54:53'),
('9396f73c4f0b992b5bcd89fe8aeefe263c5aaba12e0e12d7dce6a6e42906a9ecfbd6956a3f07ee4c', 1, 1, 'MyApp', '[]', 0, '2025-06-25 04:13:42', '2025-06-25 07:19:42', '2025-06-25 12:59:42'),
('9399c75ef1d2ad082b90109202d54e98fb1c791e83d5c6ca1082a1648b62ca63465ae4e6d3e7238d', 1, 1, 'MyApp', '[]', 0, '2025-06-17 04:47:58', '2025-06-17 04:55:16', '2025-06-17 10:35:16'),
('94adb2ee20e5e39b772e190cab644a362573aab2a2a6dfb5ef1013d2009d83bb8deaa32940b36ceb', 1, 1, 'MyApp', '[]', 0, '2025-06-26 02:14:13', '2025-06-26 03:06:18', '2025-06-26 08:46:18'),
('9575df0d237460cc098347cde81c7e17e450e7449dfbdc3d189d73f7b01219399e7bcd04c6696a57', 21, 1, 'MyApp', '[]', 0, '2025-06-25 03:47:24', '2025-06-25 03:47:48', '2025-06-25 09:27:48'),
('99618b106fd7bcd02f16d1dcb4b4d64fe892b300fe4176db7efaa4fb8b64e53d6785f1af903b6365', 1, 1, 'MyApp', '[]', 0, '2025-06-23 02:50:31', '2025-06-23 02:59:56', '2025-06-23 08:39:56'),
('99aed1047265c388bbd5fab68e53503eea5e5fe6ff68c28f6708f629fcd75fbeb577a55bdc365a89', 1, 1, 'MyApp', '[]', 0, '2025-06-27 02:27:21', '2025-06-27 02:30:18', '2025-06-27 08:10:18'),
('9c0caf299848c1829cb104bdbb592917287377edea981bc51ce6006f9aea73d6b4c2960fbdf9ceb1', 1, 1, 'MyApp', '[]', 0, '2025-06-19 07:48:05', '2025-06-19 07:48:39', '2025-06-19 13:28:39'),
('9d95cb753e967b02faee905cf2bb41103ed7030dc14a49747012e03acbfd0537d3a9e151e35ceeb2', 1, 1, 'MyApp', '[]', 0, '2025-06-12 02:29:25', '2025-06-12 02:29:53', '2025-06-12 08:09:53'),
('a0596ea8e4c9bb8364ab761dffe0f3fe7299fed2d2be934ec314adeba80af9ccd36fad62283a39a1', 1, 1, 'MyApp', '[]', 0, '2025-06-13 05:29:26', '2025-06-13 05:29:30', '2025-06-13 11:09:30'),
('a0dbf7328e4325a65976d5a3a41f2a02288d7991278b66635d9569006bd3e8846dbfbfe65eaffca3', 21, 1, 'MyApp', '[]', 0, '2025-06-06 01:03:49', '2025-06-06 01:03:50', '2025-06-06 06:43:49'),
('a420f1c55dbc13c0eab1ee71e98ebbbcf8a68290d72ce1f3db467789874f13fe687ccb9327262bb6', 1, 1, 'MyApp', '[]', 0, '2025-06-09 05:27:25', '2025-06-09 05:57:43', '2025-06-09 11:37:43'),
('a5b213461d81c30158ee330169b778afb33b7ed7836e4150790f62ec5afa6f778df9ac8e6cd92b6f', 1, 1, 'MyApp', '[]', 0, '2025-06-26 03:46:50', '2025-06-26 04:25:34', '2025-06-26 10:05:34'),
('a61f308a14aa4b12ee170e52dace8338312d51aa721db63eebb0f83c996764a7122ab6b4c539eb02', 1, 1, 'MyApp', '[]', 0, '2025-06-16 04:13:32', '2025-06-16 04:33:22', '2025-06-16 10:13:22'),
('a72667d88dea4068b5a2352e1dc267fa883044d66e82cc460426ac96625f50f67ba8eb38efcbce8b', 1, 1, 'MyApp', '[]', 0, '2025-06-10 03:49:09', '2025-06-10 04:37:56', '2025-06-10 10:17:56'),
('a7e812155a7b3fc947d0e95bb3d1d342eb9213211284cb852a26bc4d8e40b91288708474e61dee42', 1, 1, 'MyApp', '[]', 0, '2025-06-25 04:02:11', '2025-06-25 04:02:20', '2025-06-25 09:42:20'),
('a81f2b79b107a8bace3a4d116ea598396ab9d86beef070bfef83c00562de935e9166b8d930fc389e', 1, 1, 'MyApp', '[]', 0, '2025-06-24 00:21:02', '2025-06-24 01:25:33', '2025-06-24 07:05:33'),
('a93b31900e9671c162fcc6410ca5993c9c156bc3c75ed2be1b596920e0b780c2b144fc1fbe3acc0c', 1, 1, 'MyApp', '[]', 0, '2025-06-11 01:31:55', '2025-06-11 02:58:41', '2025-06-11 08:38:41'),
('a979fbbb116c5ea961cbb079d87add1e71b9b37b9d949cdc60b4237183c084c29a71f49f27d84e53', 1, 1, 'MyApp', '[]', 0, '2025-06-17 03:59:51', '2025-06-17 04:33:36', '2025-06-17 10:13:36'),
('aa28b7a52da4afaea006019cd5bbbefdf703f1566c254beee17fa9170e5511ae5c7e6b675f18b364', 1, 1, 'MyApp', '[]', 0, '2025-06-20 06:59:26', '2025-06-20 07:13:36', '2025-06-20 12:53:36'),
('aa8c4d6ef774d466a4ae46ee29d6782567fd62fa67fc54483445e0eed3842069ad614a2ce52172de', 1, 1, 'MyApp', '[]', 0, '2025-06-19 05:20:24', '2025-06-19 05:21:12', '2025-06-19 11:01:12'),
('ac51dc8af8b026cc64a839a896247a32402b40add2e88a088efbeca7eda1ab231adec940be880b3f', 1, 1, 'MyApp', '[]', 0, '2025-06-25 07:50:37', '2025-06-25 07:59:21', '2025-06-25 13:39:21'),
('ad131a500d87814a6d54e186c602200bcfcdeb2427e619ce4eda215ab799cee10f6c0fae66ace9f9', 22, 1, 'MyApp', '[]', 0, '2025-06-06 01:20:25', '2025-06-06 01:20:25', '2025-06-06 07:00:25'),
('ae3fad8baf0811b3e918878d4c466f2de7767e50e18e21d329d1490fc6a3551ce51d978b35932807', 21, 1, 'MyApp', '[]', 0, '2025-06-25 07:06:24', '2025-06-25 07:06:24', '2025-06-25 12:46:24'),
('aff96b8db86fd2453fd8da03297130a1a424d783d975599e87ed71ad2f5c833d13e9286441c5efce', 1, 1, 'MyApp', '[]', 0, '2025-06-09 04:56:08', '2025-06-09 04:56:08', '2025-06-09 10:36:08'),
('b1a0d9c1fbeacb1a28548b52d53a9c0e4c0c64e6dab1cc900c808fe90be790a778b4f8634e6def36', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:53:53', '2025-06-06 03:53:53', '2025-06-06 09:33:53'),
('b26ff82c98b5c1432d7295a4306111ade49463f0e55468c4d4d104bbd8069fb02c562b50cebe49ff', 22, 1, 'MyApp', '[]', 0, '2025-06-17 04:33:49', '2025-06-17 04:34:02', '2025-06-17 10:14:02'),
('b2a0e5b5d2f16e249075071ee58c212d94fc444a77feb6dcb2eab75b7e3abbaca82b0af3fcf129a6', 21, 1, 'MyApp', '[]', 0, '2025-06-23 06:11:59', '2025-06-23 06:11:59', '2025-06-23 11:51:59'),
('b32d68a2c22c9d84a1a2b75170624d657a5075fb495a2b6ddf7a44cc2e828007e8f143ebcf40af76', 1, 1, 'MyApp', '[]', 0, '2025-06-09 05:21:22', '2025-06-09 05:21:48', '2025-06-09 11:01:48'),
('b32fa8193c1f6f272dc6fb0ec413fc554ef3a8092d674fb16f81605043894a24fcfcada5f2b0f9ce', 1, 1, 'MyApp', '[]', 0, '2025-06-25 23:45:27', '2025-06-26 02:03:47', '2025-06-26 07:43:47'),
('b3f3cbefcb1ac3471ab4f8c57fc7855d746d45ffcc6ad6f65231748f292a5eca09d88fa8aec7c030', 1, 1, 'MyApp', '[]', 0, '2025-06-23 01:25:10', '2025-06-23 02:12:39', '2025-06-23 07:52:39'),
('b41fef8c56e2e5145c7c7d88da0dafa1bdfdd8a7847a1c1a720fe6bb3099134a23613d0fcdcfb2bf', 1, 1, 'MyApp', '[]', 0, '2025-06-24 04:02:33', '2025-06-24 07:43:32', '2025-06-24 13:23:32'),
('b4a750e42e7633647c3910a3a9b2846e49be8613ac0c24062a23ae39b47fd4309fc7a6628185a768', 21, 1, 'MyApp', '[]', 0, '2025-06-25 02:47:09', '2025-06-25 02:48:21', '2025-06-25 08:28:21'),
('b5689facaf21d1eca5d9398c33147c6c230125ec96a7f2daaa184355789de31e628f2df4fbc8f6d0', 21, 1, 'MyApp', '[]', 0, '2025-06-06 01:05:44', '2025-06-06 01:05:44', '2025-06-06 06:45:44'),
('b6226f0e27573b7d24fdc5010c53e0f5983cbd535498213deca633a3d7fc65db0f6d339320d4d1fa', 21, 1, 'MyApp', '[]', 0, '2025-06-27 03:54:04', '2025-06-27 03:54:04', '2025-06-27 09:34:04'),
('b64517cc6541305bfdaa092036ddf528bf95a6dc70454b015e806ce5841427ac17ad809f066e9801', 21, 1, 'MyApp', '[]', 0, '2025-06-06 04:45:01', '2025-06-06 04:45:01', '2025-06-06 10:25:01'),
('b7a30e6656e488a4fc2f46f802016877114d1d5665a4c2e538c303b5ca2c94e1d2c28db2874565e9', 21, 1, 'MyApp', '[]', 0, '2025-06-25 07:57:00', '2025-06-25 07:57:42', '2025-06-25 13:37:42'),
('b85589281ff7ea44277727e4b7a15df9a2e710332c3939b66bc46d98b4c464c84fff721467eb75d3', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:46:50', '2025-06-06 03:46:50', '2025-06-06 09:26:50'),
('b9bdf21d7ab44cac327ddd9c508ab785a8b42047520ed0cf1b4c38cd31611134b2536313ad008945', 1, 1, 'MyApp', '[]', 0, '2025-06-20 01:48:18', '2025-06-20 03:08:18', '2025-06-20 08:48:18'),
('bbe431fb2908dd1f5a00c219676bed643bb6238b59531a6214af59bca602e5870f7d7e9dc4903c2d', 1, 1, 'MyApp', '[]', 0, '2025-06-16 01:49:25', '2025-06-16 01:49:28', '2025-06-16 07:29:28'),
('bcc7bb685642ccf0856623d084e89dfe2c4f1e67d08108ab81b2876f04e5064966912ef6ace36a83', 21, 1, 'MyApp', '[]', 0, '2025-06-06 07:01:27', '2025-06-06 07:01:27', '2025-06-06 12:41:27'),
('bd7e01e2f231bdc4da4408959505b4fca351f2bc810c41d0374b7aa6738f11f1d90cf7d54afebc8b', 1, 1, 'MyApp', '[]', 0, '2025-06-09 02:09:15', '2025-06-09 02:09:15', '2025-06-09 07:49:15'),
('bf37d597967304c58687b3b0a55e82b704f54697ea312b8964d2bbdddb25e65a8ab540bf85741317', 1, 1, 'MyApp', '[]', 0, '2025-06-20 03:57:41', '2025-06-20 06:16:55', '2025-06-20 11:56:55'),
('bf64759aba77f3467cebc084592f7da30524ade96abb40360ed14e3776d254c3afce4d153f64df55', 1, 1, 'MyApp', '[]', 0, '2025-06-17 01:07:35', '2025-06-17 01:32:13', '2025-06-17 07:12:13'),
('bfdacfee43c05140466d8387b40cbe7ceb323c4c602f8b54112ca1cf78013ae60b0b54aa9df7f4e1', 21, 1, 'MyApp', '[]', 0, '2025-06-13 04:14:56', '2025-06-13 04:15:00', '2025-06-13 09:55:00'),
('c05b284c89f0a8359934691b321fdec9dc6cbd9fb094149759198f6f4988c7ef923c2da5ebd8d8ca', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:57:17', '2025-06-06 03:57:17', '2025-06-06 09:37:17'),
('c250dcf49007fd010dc931ed9393635f2347cb3044b6aa09dbf022d146d77690162846fc4b601e55', 1, 1, 'MyApp', '[]', 0, '2025-06-24 03:50:18', '2025-06-24 03:50:18', '2025-06-24 09:30:18'),
('c270c7655222d5f6a2622fb0019c93f105eba1eb4aedc5481074684024dd48aa0dc3fbef22d4068d', 1, 1, 'MyApp', '[]', 0, '2025-06-25 03:48:19', '2025-06-25 03:48:52', '2025-06-25 09:28:52'),
('c449b59994a72c598cee450b26a63b936a19a5bb44cf358dc919203b47a30277f2b757f1d90d8032', 21, 1, 'MyApp', '[]', 0, '2025-06-25 03:01:09', '2025-06-25 03:01:09', '2025-06-25 08:41:09'),
('c4ad8727582a4d2a3ebe63959af424a4c54b7207232bf198cf428f237ff6c2b22304e015921dc214', 1, 1, 'MyApp', '[]', 0, '2025-06-26 05:32:27', '2025-06-26 07:59:48', '2025-06-26 13:39:48'),
('c521abd0824b113bb4115866b1e9936a7eef468fa6d667b5ddc13c9640bd6e22813cd5481edf711f', 21, 1, 'MyApp', '[]', 0, '2025-06-20 03:57:25', '2025-06-20 03:57:25', '2025-06-20 09:37:25'),
('c588304caa1e7312b976a6f76aa78a2fb0f63544356575a3bce83b9d83b57fe94aa2aa520ce57926', 1, 1, 'MyApp', '[]', 0, '2025-06-16 23:44:35', '2025-06-17 00:51:15', '2025-06-17 06:31:15'),
('c68821ae37eab9d8b8f6660bb4821025fd89e9d4dccb73da98dfc2d2f4320cdd6ede237d24cd2b49', 1, 1, 'MyApp', '[]', 0, '2025-06-09 03:43:49', '2025-06-09 04:20:09', '2025-06-09 10:00:09'),
('c72e3983ff0e710b98298d4ad3dceba1e3f3b8fecb9c94a7aa8474ac8c04061183e07c618f28272b', 21, 1, 'MyApp', '[]', 0, '2025-06-13 00:18:30', '2025-06-13 00:19:19', '2025-06-13 05:59:19'),
('c8bf88df7d5497781364f2c58d3ac1b4a490bff9b0e7e2a9fc913c53d7ba9dea5e374d90703a91ff', 22, 1, 'MyApp', '[]', 0, '2025-06-06 04:34:55', '2025-06-06 04:34:55', '2025-06-06 10:14:55'),
('ca0c9869abafa3e35d63f62d9fc4462ba1689e5bb8d9a2f6926c256481a9d0cb46d33cc8c3eb1aae', 1, 1, 'MyApp', '[]', 0, '2025-06-19 03:06:47', '2025-06-19 03:06:47', '2025-06-19 08:46:47'),
('cc5925048b394c41e1c254b1d9d8e97f9af18501dd914ef2e1de331462b5fa9e7c58e0922f52e8ab', 1, 1, 'MyApp', '[]', 0, '2025-06-17 02:54:42', '2025-06-17 03:01:23', '2025-06-17 08:41:23'),
('ccd0a9369aea586098d3d4c92787a651ed5dcd5d6ca61a5b0507eb493706da1d2778f35bfc140aad', 1, 1, 'MyApp', '[]', 0, '2025-06-19 08:01:11', '2025-06-19 08:01:20', '2025-06-19 13:41:20'),
('cd6749ac7d0d75bfe38aa4a7bf02346711a95d59e068512166fd3fba9717a71b0c118d074ea6c0e4', 21, 1, 'MyApp', '[]', 0, '2025-06-23 05:38:08', '2025-06-23 05:42:25', '2025-06-23 11:22:25'),
('ce919921a9ae2a93f3ecee7ed7f1e873a080a248c7ba495f175855fc766cfa09be9bfb5b9ee3b64a', 1, 1, 'MyApp', '[]', 0, '2025-06-24 03:53:37', '2025-06-24 03:53:37', '2025-06-24 09:33:37'),
('cea48aded0c087ed56f48630a03f811f28e5192f2dd83a10b45a12731a07a19e21577b945ae7326e', 1, 1, 'MyApp', '[]', 0, '2025-06-09 06:07:50', '2025-06-09 06:09:36', '2025-06-09 11:49:36'),
('d161b8140ce1dfa0c9430a72ae0a134e75598b3ca58301b2ef3721aca3ef774cd836522cc6b32cba', 1, 1, 'MyApp', '[]', 0, '2025-06-19 05:43:50', '2025-06-19 07:25:39', '2025-06-19 13:05:39'),
('d18477a560e74ba43d71db6e6a2574faef8e832db130d5359c242657fcb722149925a910369bde2c', 1, 1, 'MyApp', '[]', 0, '2025-06-19 03:44:29', '2025-06-19 03:45:23', '2025-06-19 09:25:23'),
('d1eaaa364f8deaf272514ddf395d11d8c47a660996e84845347789f24cb023885f2b58f93b64fdfb', 21, 1, 'MyApp', '[]', 0, '2025-06-13 02:30:22', '2025-06-13 02:30:23', '2025-06-13 08:10:22'),
('d2336700efa93f2fcde242df0f13678b4d157413ff3eb8be9948b7daf1d4bf60a80b5297380757bf', 21, 1, 'MyApp', '[]', 0, '2025-06-06 07:28:29', '2025-06-06 07:28:29', '2025-06-06 13:08:29'),
('d2b2b1a8c17e172723d982dfc6088e000b85829e3574dda40983632237190dbf7b3d3792b4f1a481', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:01:48', '2025-06-06 03:01:48', '2025-06-06 08:41:48'),
('d31f980f2542b26aad1b08cc609187ab392a51fa25d297e507d880b1c8dd85bccc8416edc1f750d3', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:42:32', '2025-06-06 03:42:32', '2025-06-06 09:22:32'),
('d35876e1c79acd19279edb63b266a1acec4d6e8ced59239c498c499d052c588a6459c53c1f738fa4', 1, 1, 'MyApp', '[]', 0, '2025-06-16 07:59:15', '2025-06-16 07:59:23', '2025-06-16 13:39:23'),
('d398354089d7b3e490b4ce9237570ed03ef59d94efaa5f08d359497a50bcc302dee31ad619762406', 1, 1, 'MyApp', '[]', 0, '2025-06-09 02:05:16', '2025-06-09 02:05:16', '2025-06-09 07:45:16'),
('d3f0cd10a998401b94c582f88158b35f165eb969519edff27eb009c5513f6da3e5b9b0778e3b70c9', 21, 1, 'MyApp', '[]', 0, '2025-06-10 07:20:14', '2025-06-10 07:22:20', '2025-06-10 13:02:20'),
('d3fd3a96196ada29769a469c75d268a6e9f5e32c848f86f3322e91ce6a23078eb7cc9425942fb21c', 21, 1, 'MyApp', '[]', 0, '2025-06-24 00:43:48', '2025-06-24 00:49:49', '2025-06-24 06:29:49'),
('d5ed1c15bc906674bffcebfddd5bee3697f4e2a665522565ce4ff0d9039d12a41ee275de0cec7a5b', 1, 1, 'MyApp', '[]', 0, '2025-06-17 23:48:39', '2025-06-18 00:16:25', '2025-06-18 05:56:25'),
('db1aebcdb4c69e7c1423add482dc02137d2ef17fcd9298fff8fccbc13455619b6ee7df5b5cae2199', 21, 1, 'MyApp', '[]', 0, '2025-06-13 02:17:37', '2025-06-13 02:28:15', '2025-06-13 08:08:15'),
('dcca564e93b0efc319a8077c625655eca38f53b5ce9480d6470aef83d4b7b3a8189cc8096c45f526', 1, 1, 'MyApp', '[]', 0, '2025-06-09 06:55:37', '2025-06-09 07:21:25', '2025-06-09 13:01:25'),
('dd00ac8fcb390c9145dae571c57dbfd34dae99bf52d64ad68a3f16e2d93b2b8937b1bc8a110bd8a0', 22, 1, 'MyApp', '[]', 0, '2025-06-05 06:33:31', '2025-06-05 06:33:32', '2025-06-05 12:13:31'),
('de79668ce9a6fa2eec70d7e264e3d7287351afe8d21aa7d4d03651a900f5c08c709521ba3672f7bb', 1, 1, 'MyApp', '[]', 0, '2025-06-09 02:10:12', '2025-06-09 03:06:49', '2025-06-09 08:46:49'),
('df57234f5475d3e042334aa8cb242f62985c8c25c9b9a1613c97085ba586995f29f88383e7283b06', 22, 1, 'MyApp', '[]', 0, '2025-06-06 02:43:51', '2025-06-06 02:43:52', '2025-06-06 08:23:51'),
('e26ce3b822c4be858d7c59602e13eb1b529c515543ac2aa887fb26a89612605a0d4d3da7195f8178', 21, 1, 'MyApp', '[]', 0, '2025-06-25 02:22:01', '2025-06-25 02:43:17', '2025-06-25 08:23:17'),
('e3aa35324798a43e8fac810383a8e3064bc2ee5f8f7d1c9e3e8a19f51eb3b5ed641b173ca5720d66', 1, 1, 'MyApp', '[]', 0, '2025-06-20 00:34:22', '2025-06-20 00:39:59', '2025-06-20 06:19:59'),
('e3c88b08f81b62bbaef30930a0cbc1d85cf67783486eb48e912a1965a87cdd866e9f7d9c7d6ed1a0', 1, 1, 'MyApp', '[]', 0, '2025-06-23 03:00:34', '2025-06-23 03:01:09', '2025-06-23 08:41:09'),
('e7c8468c6ac1da67b720d394ac49901333d87b2f9930e7960ef180f40ac196ff224ed22e0d63e802', 21, 1, 'MyApp', '[]', 0, '2025-06-13 05:16:23', '2025-06-13 05:16:34', '2025-06-13 10:56:34'),
('eb6d1b737b0b4d081799c6fc2feabc720dafbb683bdbd61e9ad7d3cb45028f9ab836b61ef547d99e', 21, 1, 'MyApp', '[]', 0, '2025-06-12 05:42:44', '2025-06-12 05:42:44', '2025-06-12 11:22:44'),
('ec4ff7421b8ec82e79e00e4cf46c1c202e5894829d3641e1be52358c3f74041f04ec3fe6bbfe8f67', 1, 1, 'MyApp', '[]', 0, '2025-06-09 06:10:45', '2025-06-09 06:10:46', '2025-06-09 11:50:45'),
('ecfbd32cbc978561a0bf22dedcc70255c1aa9d7fe161b636fe061ea04a92e69280cf367512d6a08e', 22, 1, 'MyApp', '[]', 0, '2025-06-06 03:51:38', '2025-06-06 03:51:39', '2025-06-06 09:31:38'),
('ed1ab9f3c3b607f32e7f24361c0c24c3c5012d8ae9dbf2adaf0bb969e748a1cc80b8067933571a93', 1, 1, 'MyApp', '[]', 0, '2025-06-12 04:01:28', '2025-06-12 04:01:30', '2025-06-12 09:41:30'),
('ed3ee17b503a1b875807935e43deff2ba608746884a2d89ebfd42e9f99e0b802ab3d58977d3a736d', 21, 1, 'MyApp', '[]', 0, '2025-06-06 07:31:12', '2025-06-06 07:31:12', '2025-06-06 13:11:12'),
('ef122f893cdf471652a0ae0be329fd35b1aaca7cfed7120417406886764d89a444ce6b47df96cca8', 1, 1, 'MyApp', '[]', 0, '2025-06-12 04:00:23', '2025-06-12 04:00:27', '2025-06-12 09:40:27'),
('ef2130afe509d0d09d6801fb725736fd5cac7fe2c1e159d0f1ece1a9d99392999f07023fa7ab77ca', 1, 1, 'MyApp', '[]', 0, '2025-06-10 07:22:38', '2025-06-10 08:00:42', '2025-06-10 13:40:42'),
('f01092892725f12a2b91d792d722e7645f806be6ef6a2f1b2df7370147c283a8a3bcc97842c2dd63', 1, 1, 'MyApp', '[]', 0, '2025-06-17 01:33:47', '2025-06-17 02:38:21', '2025-06-17 08:18:21'),
('f03f26c53b7c472ab8a11fb1e8a182afd32f4fb642fba50ae2c1914d81ad8eecdbc76847cd9f1551', 1, 1, 'MyApp', '[]', 0, '2025-06-23 03:44:40', '2025-06-23 03:45:54', '2025-06-23 09:25:54'),
('f06c7992e709addfcaf22d327bd55245343b3bcc3358120461aee20337d7eb128408e807164da734', 22, 1, 'MyApp', '[]', 0, '2025-06-05 05:03:49', '2025-06-05 05:07:57', '2025-06-05 10:47:57'),
('f07d05e47d90f8f844e1f2ae6d8d02a5c379e8546eb520fe7898473cdb1a7584b3ddac08fcfb6b14', 1, 1, 'MyApp', '[]', 0, '2025-06-24 23:52:52', '2025-06-24 23:53:05', '2025-06-25 05:33:05'),
('f0a914b305699795a8b59ea73a7ac4b55c43bba070a8f871428321b064f9641cabb32a182820632d', 21, 1, 'MyApp', '[]', 0, '2025-06-23 07:01:43', '2025-06-23 07:01:43', '2025-06-23 12:41:43'),
('f13a89d61db94bc6afeee4265d657d602c0d48a9295950545219b0289bf8552cff3d6249dc0472aa', 22, 1, 'MyApp', '[]', 0, '2025-06-06 04:28:40', '2025-06-06 04:28:40', '2025-06-06 10:08:40'),
('f14bbb59238924ba03b7205d0ca995ee0025b5d28a7334914604ff550688497e715225d941996038', 1, 1, 'MyApp', '[]', 0, '2025-06-27 03:51:46', '2025-06-27 03:55:28', '2025-06-27 09:35:28'),
('f1aa56b0cb10997a5307d7b3f019f1c16f184dafca518e2ef5db6fbea2ea1759ee1ebb4eb5910de3', 21, 1, 'MyApp', '[]', 0, '2025-06-13 04:12:34', '2025-06-13 04:13:15', '2025-06-13 09:53:15'),
('f3047e7de1c21bdb41afcfb3ccac3230944a583a49e56c88bdb64da7eb6876dc970b505048dc094b', 1, 1, 'MyApp', '[]', 0, '2025-06-10 00:21:19', '2025-06-10 02:18:31', '2025-06-10 07:58:31'),
('f325d9f4597977cafdad84279378bc850bf7bd9028d9e98284f9e4bd6a07540ea4c5bf25ed19906e', 22, 1, 'MyApp', '[]', 0, '2025-06-06 02:26:37', '2025-06-06 02:26:37', '2025-06-06 08:06:37'),
('f6e97d084ed2731014b0dd870ad46edf2e0f863eb6361669b4356632ed35fac35178c99eacaa311c', 21, 1, 'MyApp', '[]', 0, '2025-06-06 04:43:28', '2025-06-06 04:43:29', '2025-06-06 10:23:28'),
('f7ccac250d66b0137452d0fe0f66aef07762d074a76322b1d94d7dbb58ba5c14f15f70ccf77a47c7', 1, 1, 'MyApp', '[]', 0, '2025-06-23 02:12:42', '2025-06-23 02:13:15', '2025-06-23 07:53:15'),
('f84028a55b4f8da48f71a5fa0af1e5b3ce793156373d6e39182126da9103a7a70832d5471b5523aa', 22, 1, 'MyApp', '[]', 0, '2025-06-17 03:58:54', '2025-06-17 03:59:42', '2025-06-17 09:39:42'),
('f9185e4984ebd71adeca506c841275604833c3baba2334be7ecc612f6111e4f4dc9c4f59f0cec1be', 21, 1, 'MyApp', '[]', 0, '2025-06-10 07:15:19', '2025-06-10 07:19:31', '2025-06-10 12:59:31'),
('f9484f386b0ab2117e995e023c2a85455e1a0b00a0bb00f855bf9b98301d1c73a5f429ee3a94bfe8', 1, 1, 'MyApp', '[]', 0, '2025-06-16 06:13:05', '2025-06-16 07:39:51', '2025-06-16 13:19:51'),
('fa2a0f8784c955d599788825c456f787990152abc1d4dd3ccc137b630f20552db851095f9aae297c', 21, 1, 'MyApp', '[]', 0, '2025-06-24 07:34:47', '2025-06-24 07:34:47', '2025-06-24 13:14:47'),
('fc3d58d7a7e42b90cb3059b8e6c47663dfa16d08f908b236c2e6822ec20ce90c5c78574f6f7e1bb4', 21, 1, 'MyApp', '[]', 0, '2025-06-25 03:02:54', '2025-06-25 03:02:54', '2025-06-25 08:42:54'),
('fcf10d9b92ad707f7051c49491835ba0f06995506e8b57c596dab26eb6c392c0bb820a7fd9f61d01', 21, 1, 'MyApp', '[]', 0, '2025-06-12 05:45:17', '2025-06-12 05:45:28', '2025-06-12 11:25:28'),
('fd48a4d5d219774b054deec31a06010b484754caa37f9a4a4ed7e21de11a30cc27b83be80babc777', 1, 1, 'MyApp', '[]', 0, '2025-06-17 04:36:49', '2025-06-17 04:47:16', '2025-06-17 10:27:16'),
('fd5062cc0adf60401f8deb813badf8d86b4d55a372b6cdfcf4ed688a9de19692a22fba12ea82dde8', 1, 1, 'MyApp', '[]', 0, '2025-06-16 07:59:35', '2025-06-16 08:01:19', '2025-06-16 13:41:19'),
('ff5294b11c2c84a96596ddb971ee9ebf35b4787f5bfe1831f8d61e367ea8b826b266e8c7a27958fa', 1, 1, 'MyApp', '[]', 0, '2025-06-10 07:14:49', '2025-06-10 07:15:05', '2025-06-10 12:55:05');

-- --------------------------------------------------------

--
-- Table structure for table `oauth_auth_codes`
--

CREATE TABLE `oauth_auth_codes` (
  `id` varchar(100) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `scopes` text DEFAULT NULL,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `oauth_clients`
--

CREATE TABLE `oauth_clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `secret` varchar(100) DEFAULT NULL,
  `provider` varchar(255) DEFAULT NULL,
  `redirect` text NOT NULL,
  `personal_access_client` tinyint(1) NOT NULL,
  `password_client` tinyint(1) NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `oauth_clients`
--

INSERT INTO `oauth_clients` (`id`, `user_id`, `name`, `secret`, `provider`, `redirect`, `personal_access_client`, `password_client`, `revoked`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Laravel Personal Access Client', 'pL1qPxIPyycIhBV3AjwzaxOwzS41QqbdPkMXf9hM', NULL, 'http://localhost', 1, 0, 0, '2025-05-27 01:32:23', '2025-05-27 01:32:23'),
(2, NULL, 'Laravel Password Grant Client', '62iTKZ0UbQvuTPrCIadlNZURLNks2jcEnhfOTMze', 'users', 'http://localhost', 0, 1, 0, '2025-05-27 01:32:23', '2025-05-27 01:32:23');

-- --------------------------------------------------------

--
-- Table structure for table `oauth_personal_access_clients`
--

CREATE TABLE `oauth_personal_access_clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `oauth_personal_access_clients`
--

INSERT INTO `oauth_personal_access_clients` (`id`, `client_id`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-05-27 01:32:23', '2025-05-27 01:32:23');

-- --------------------------------------------------------

--
-- Table structure for table `oauth_refresh_tokens`
--

CREATE TABLE `oauth_refresh_tokens` (
  `id` varchar(100) NOT NULL,
  `access_token_id` varchar(100) NOT NULL,
  `revoked` tinyint(1) NOT NULL,
  `expires_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
('sandeep.intnxt@gmail.com', '$2y$12$/mI4M0etFyOzO0LBSHT2BuryLdwhO9uP6CfIyxPJhGLGigwQd0PES', '2025-06-27 03:55:43'),
('user@example.com', '$2y$12$Fk2Ctnk7gxlJYWsjusLFLe3V3bADrUqOu1s8/UwP44ilWrHTjmRPK', '2025-06-06 02:00:24');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `module_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `display_name`, `name`, `type`, `module_name`, `created_at`, `updated_at`) VALUES
(1, 'Dashboard', 'dashboard', 'module', 'App/User', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(2, 'Data Import', 'data_import', 'module', 'App/DataImport', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(3, 'Text Messages', 'text_messages', 'module', 'App/TextMessage', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(4, 'Company Information', 'company_information', 'module', 'App/CompanyInformation', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(5, 'Company Preferences', 'company_preferences', 'module', 'App/CompanyPreference', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(6, 'Payment Gateway Settings', 'payment_gateway_settings', 'module', 'App/PaymentGatewaySetting', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(7, 'Estimate & Job Statuses', 'estimate_&_job_statuses', 'module', 'App/Estimate&JobStatuse', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(8, 'Service Contract Terms', 'service_contract_terms', 'module', 'App/ServiceContractTerm', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(9, 'Communication Templates', 'communication_templates', 'module', 'App/CommunicationTemplate', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(10, 'Outbound Email Settings', 'outbound_email_settings', 'module', 'App/OutboundEmailSetting', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(11, 'Electronic Fax Settings', 'electronic_fax_settings', 'module', 'App/ElectronicFaxSetting', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(12, 'Online & App Booking Settings', 'online_&_app_booking_settings', 'module', 'App/Online&AppBookingSetting', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(13, 'Referral Sources', 'referral_sources', 'module', 'App/ReferralSource', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(14, 'Workforce Management', 'workforce_management', 'module', 'App/WorkforceManagement', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(15, 'Service Agreement Management', 'service_agreement_management', 'module', 'App/ServiceAgreementManagement', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(16, 'Integrations', 'integrations', 'module', 'App/Integration', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(17, 'Crew Management', 'crew_management', 'module', 'App/CrewManagement', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(18, 'Fleet Management', 'fleet_management', 'module', 'App/FleetManagement', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(19, 'Vendor Management', 'vendor_management', 'module', 'App/VendorManagement', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(20, 'Inventory Management', 'inventory_management', 'module', 'App/InventoryManagement', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(21, 'Product Catalog', 'product_catalog', 'module', 'App/ProductCatalog', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(22, 'Purchase Orders Management', 'purchase_orders_management', 'module', 'App/PurchaseOrdersManagement', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(23, 'Service Catalog', 'service_catalog', 'module', 'App/ServiceCatalog', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(24, 'Taxes, Fees & Discounts', 'taxes,_fees_&_discounts', 'module', 'App/Taxes,Fees&Discount', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(25, 'Job Categories', 'job_categories', 'module', 'App/JobCategorie', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(26, 'Company Memos', 'company_memos', 'module', 'App/CompanyMemo', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(27, 'Notification Templates', 'notification_templates', 'module', 'App/NotificationTemplate', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(28, 'Customers', 'customers', 'module', 'App/User', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(29, 'Projects', 'projects', 'module', 'App/Project', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(30, 'Grid', 'grid', 'module', 'App/User', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(31, 'Dispatch Zones', 'dispatch_zones', 'module', 'App/DispatchZone', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(32, 'Fleet Tracking', 'fleet_tracking', 'module', 'App/FleetTracking', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(33, 'Calendar', 'calendar', 'module', 'App/User', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(34, 'Invoices', 'invoices', 'module', 'App/Invoice', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(35, 'Invoice Payments', 'invoice_payments', 'module', 'App/InvoicePayment', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(36, 'Sales Revenue', 'sales_revenue', 'module', 'App/SalesRevenue', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(37, 'Sales Commission', 'sales_commission', 'module', 'App/SalesCommission', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(38, 'Payroll', 'payroll', 'module', 'App/Payroll', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(39, 'Jobs', 'jobs', 'module', 'App/Job', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(40, 'Estimates', 'estimates', 'module', 'App/Estimate', '2025-06-19 11:33:22', '2025-06-19 11:33:22'),
(41, 'Limit estimate & job visibility', 'limit_estimate_n_job_visibility', 'worker_app_estimation', NULL, '2025-06-19 11:35:43', '2025-06-19 11:35:43'),
(42, 'Allow users to create jobs in the field worker app', 'allow_users_create_jobs', 'worker_app', NULL, '2025-06-19 11:35:43', '2025-06-19 11:35:43'),
(43, 'Allow user to modify own time logs in field worker app', 'allow_users_modify_own_time_log', 'worker_app', NULL, '2025-06-19 11:35:43', '2025-06-19 11:35:43'),
(44, 'Allow user to view customer details in field worker app', 'allow_user_view_customer_detail', 'worker_app', NULL, '2025-06-19 11:35:43', '2025-06-19 11:35:43'),
(45, 'Allow user to view cost on estimates & jobs', 'allow_view_cost', 'additional', NULL, '2025-06-19 11:38:27', '2025-06-19 11:38:27'),
(46, 'Allow user to modify product and service pricing', 'allow_modify_pricing', 'additional', NULL, '2025-06-19 11:38:27', '2025-06-19 11:38:27');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `active` int(1) NOT NULL DEFAULT 1 COMMENT '0 => no, 1 => yes',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin', 1, '2025-05-27 10:38:15', '2025-05-27 10:38:15'),
(2, 'User', 'user', 1, '2025-05-27 10:38:15', '2025-06-17 04:03:00'),
(12, 'Manager', 'manager', 1, '2025-06-17 05:24:17', '2025-06-27 03:53:58');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `active` int(11) NOT NULL DEFAULT 1 COMMENT '1 => Yes, 0 => No',
  `timezone` varchar(255) DEFAULT NULL,
  `country_code` varchar(255) DEFAULT NULL,
  `role_id` int(11) NOT NULL DEFAULT 2,
  `current_company_id` int(255) DEFAULT NULL,
  `gender` int(11) DEFAULT NULL,
  `company_ids` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `dob` varchar(255) DEFAULT NULL,
  `ssn` varchar(255) DEFAULT NULL,
  `driver_license_number` varchar(255) DEFAULT NULL,
  `driver_license_expiry_date` varchar(255) DEFAULT NULL,
  `order_id1` varchar(255) DEFAULT NULL,
  `order_id1_expiry_date` varchar(255) DEFAULT NULL,
  `order_id2` varchar(255) DEFAULT NULL,
  `order_id2_expiry_date` varchar(255) DEFAULT NULL,
  `order_id3` varchar(255) DEFAULT NULL,
  `order_id3_expiry_date` varchar(255) DEFAULT NULL,
  `short_bio` varchar(255) DEFAULT NULL,
  `primary_number` varchar(255) DEFAULT NULL,
  `is_mobile_number` int(11) DEFAULT 0 COMMENT '0 => no, 1 => yes',
  `show_primary_number_to_customer` varchar(255) DEFAULT NULL,
  `address1` text DEFAULT NULL,
  `address2` text DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zipcode` varchar(255) DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_number` varchar(255) DEFAULT NULL,
  `emergency_contact_relation` varchar(255) DEFAULT NULL,
  `employee_type_id` int(11) DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `hire_date` varchar(255) DEFAULT NULL,
  `original_hire_date` varchar(255) DEFAULT NULL,
  `adjusted_service_date` varchar(255) DEFAULT NULL,
  `release_date` varchar(255) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `group_assignment` varchar(255) DEFAULT NULL,
  `experience_level_id` int(11) DEFAULT NULL,
  `is_one_time_user` int(11) DEFAULT 0 COMMENT '0 => no, 1 => yes',
  `account_locked_status` int(11) DEFAULT 0 COMMENT '0 => no, 1 => yes',
  `tech_support_pin` varchar(255) DEFAULT NULL,
  `exclude_from_hours_worked_report` int(11) DEFAULT 0 COMMENT '0 => no, 1 => yes',
  `regular_rate` varchar(255) DEFAULT NULL,
  `pay_sales_commissions` varchar(255) DEFAULT NULL,
  `commission_rate_type` varchar(255) DEFAULT NULL,
  `commission_rate` varchar(255) DEFAULT NULL,
  `overtime_based_on_id` int(11) DEFAULT NULL,
  `overtime1_starts_after` varchar(255) DEFAULT NULL,
  `overtime1_rate` varchar(255) DEFAULT NULL,
  `overtime2_starts_after` varchar(255) DEFAULT NULL,
  `overtime2_rate` varchar(255) DEFAULT NULL,
  `pay_product_service_bonuses` varchar(255) DEFAULT NULL,
  `permissions` text DEFAULT NULL,
  `additional_permissions` text DEFAULT NULL,
  `worker_app_estimation_permissions` text DEFAULT NULL,
  `worker_app_permissions` text DEFAULT NULL,
  `schedules` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `email`, `email_verified_at`, `password`, `active`, `timezone`, `country_code`, `role_id`, `current_company_id`, `gender`, `company_ids`, `image`, `dob`, `ssn`, `driver_license_number`, `driver_license_expiry_date`, `order_id1`, `order_id1_expiry_date`, `order_id2`, `order_id2_expiry_date`, `order_id3`, `order_id3_expiry_date`, `short_bio`, `primary_number`, `is_mobile_number`, `show_primary_number_to_customer`, `address1`, `address2`, `city`, `state`, `zipcode`, `emergency_contact_name`, `emergency_contact_number`, `emergency_contact_relation`, `employee_type_id`, `job_title`, `department`, `hire_date`, `original_hire_date`, `adjusted_service_date`, `release_date`, `manager_id`, `group_assignment`, `experience_level_id`, `is_one_time_user`, `account_locked_status`, `tech_support_pin`, `exclude_from_hours_worked_report`, `regular_rate`, `pay_sales_commissions`, `commission_rate_type`, `commission_rate`, `overtime_based_on_id`, `overtime1_starts_after`, `overtime1_rate`, `overtime2_starts_after`, `overtime2_rate`, `pay_product_service_bonuses`, `permissions`, `additional_permissions`, `worker_app_estimation_permissions`, `worker_app_permissions`, `schedules`, `notes`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'User', 'admin12', 'admin@gmail.com', NULL, '$2y$12$5f8/iTcQxE1g09V.MXv4Bu93j4p8rw9XsmWtKnI2Qbi8QFFsMPZRi', 1, 'Asia/Kolkata', 'IN', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-27 05:09:18', '2025-05-27 05:09:18'),
(2, 'Sandeep', 'Kumar', 'sandeep123', 'sandeep@gmail.com', NULL, '$2y$12$68Mdm4RaoYFFPz6yJAHj1O1YrFoQbKNV.BvZWIzm..oDOEAn/.ciS', 1, 'Asia/Kolkata', 'IN', 12, NULL, 1, '[26]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(576) 756-7575', 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-05-27 05:10:22', '2025-06-24 07:14:52'),
(21, 'Sandeep', 'Sharma', 'sandeep_sharma14', 'sandeep.intnxt@gmail.com', NULL, '$2y$12$is2s6XGqTdNXTajIfBapRO1R.Uh9G2o2iZz5So2rmyUr6A4q73.zy', 1, 'Asia/Kolkata', 'IN', 2, 6, 1, '[6,30]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'MYna9p7MdtP2hSA4AmdbjxHgw5CPsU1Wtw1Zu31N7NXfg2tq2qMNvSJL5G5P', '2025-05-30 01:45:40', '2025-06-25 03:47:23'),
(22, 'User', 'Example', 'user_example30928357', 'user@example.com', NULL, '$2y$10$OJx/n0LYpUlFgmMMF0PfNOrB.K4cARgzotN9aDIUWhw7KbxYt2fJK', 1, 'Asia/Kolkata', 'IN', 2, 6, 1, '[6]', '1750750950_16366766331logosmaller.png', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(324) 324-3243', 0, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Senior Technician', 'Operations', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, 1, '342', 'false', '1', NULL, 1, '423', '432', '4234', '432', 'false', NULL, NULL, NULL, NULL, NULL, '423', NULL, '2025-06-03 10:13:43', '2025-06-27 04:00:16'),
(24, 'Test', 'Sharma', 'test_sharma97', 'test@fff.com', NULL, '$2y$12$2/idRjveM/w/V2Ph6JUAVu1SnmyAuU/Lj0NVRf6d1FEUrhZPeEPRu', 1, 'Asia/Kolkata', 'IN', 2, NULL, 1, '[30,6]', '1750767409_jsbaidwan_sandyrarr.rushgmail.com_1748166012921_Create_a_captiv_015a38a3-1950-4d03-9215-d8f97f7c6f5a.webp', '2025-06-19', 'SSN', 'NYD12345678', '2025-06-10', 'Other ID 1', '2025-06-24', 'Other ID 2', '2025-06-06', 'Other ID 3', '2025-06-13', 'bio', '(223) 232-3232', 1, 'false', 'New York', 'New York', 'New York', 'New York', '10001', '5', '(567) 567-6576', 't', 2, 'Senior Technician', 'Operations', '2025-06-19', '2025-06-10', '2025-05-28', '2025-06-04', 2, 'Field Technicians', 3, 1, 1, '7890', 1, '67', 'false', '2', '567', 3, '57', '756', '56', '57', 'false', NULL, NULL, NULL, NULL, NULL, '7', NULL, '2025-06-24 06:46:49', '2025-06-25 01:29:46'),
(27, 'Test', 'retrr', 'test_retrr14', '34543@feter', NULL, '$2y$12$JEnTKV3/qfzBRudOidWMauKy24jVSQZu2Jn5oI75lWMUWx94n4JRq', 1, 'Asia/Kolkata', 'IN', 2, NULL, 2, '[26]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(435) 354-3543', 0, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-25 06:38:15', '2025-06-25 06:38:15'),
(28, 'ert', 'ert', 'ert_ert31', 'er@retret', NULL, '$2y$12$crV1iZxlJ17HMPkxC2UG9OsyseShcfJJy.ubQP9Wzp6hGXbB9nbNe', 1, 'Asia/Kolkata', 'IN', 2, NULL, 1, '[26]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(345) 435-3454', 0, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-25 06:41:25', '2025-06-25 07:52:40'),
(29, 'Admin', 'Orvos Dr', 'admin_orvos_dr15', '4564@ertr', NULL, '$2y$12$gqSHrboos5yg3VbytcCQ.u2P4fwwYu21h9WJv54yK.8P6C76OuYAO', 1, 'Asia/Kolkata', 'IN', 12, NULL, 1, '[6]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(565) 465-4654', 0, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 'Senior Technician', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '7890', 0, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', '[{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"1\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"2\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"3\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"4\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"5\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"6\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"7\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"8\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"9\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"10\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"11\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"12\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"13\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"14\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"15\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"16\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"17\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"18\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"19\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"20\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"21\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"22\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"23\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"24\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"25\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"26\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"27\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"28\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"29\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"30\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"31\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"32\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"33\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"34\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":true,\"module_id\":\"35\"},{\"view\":false,\"create\":false,\"update\":true,\"delete\":false,\"module_id\":\"36\"},{\"view\":false,\"create\":true,\"update\":false,\"delete\":false,\"module_id\":\"37\"},{\"view\":true,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"38\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"39\"},{\"view\":true,\"create\":true,\"update\":true,\"delete\":true,\"module_id\":\"40\"}]', '[{\"allow_view_cost\":false},{\"allow_modify_pricing\":true}]', '[{\"limit_estimate_n_job_visibility\":true}]', '[{\"allow_users_create_jobs\":true},{\"allow_users_modify_own_time_log\":false},{\"allow_user_view_customer_detail\":true}]', NULL, NULL, NULL, '2025-06-25 06:43:51', '2025-06-27 00:06:25'),
(30, 'gdf', 'Singh', 'gdf_singh52', 'test1.intnxt@gmail.co5m', NULL, '$2y$12$Qc2WKqoXa.Yyd2gloib9xeHXsL8uN/tguLTlx0ACjc9nCNq4o6XyW', 1, 'Asia/Kolkata', 'IN', 12, NULL, 1, '[26,6]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(345) 354-3543', 0, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, '54', 0, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', '[{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"1\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"2\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"3\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"4\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"5\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"6\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"7\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"8\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"9\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"10\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"11\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"12\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"13\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"14\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"15\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"16\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"17\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"18\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"19\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"20\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"21\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"22\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"23\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"24\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"25\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"26\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"27\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"28\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"29\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"30\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"31\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"32\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"33\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"34\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"35\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"36\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"37\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"38\"},{\"view\":true,\"create\":true,\"update\":true,\"delete\":true,\"module_id\":\"39\"},{\"view\":true,\"create\":true,\"update\":true,\"delete\":true,\"module_id\":\"40\"}]', '[{\"allow_view_cost\":true},{\"allow_modify_pricing\":true}]', '[{\"limit_estimate_n_job_visibility\":true}]', '[{\"allow_users_create_jobs\":true},{\"allow_users_modify_own_time_log\":true},{\"allow_user_view_customer_detail\":true}]', '[{\"sunday\":{\"shift_start\":\"23:54\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"monday\":{\"shift_start\":\"\",\"shift_end\":\"11:54\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"tuesday\":{\"shift_start\":\"\",\"shift_end\":\"11:57\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"wednesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"thursday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"friday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"saturday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"}}]', NULL, NULL, '2025-06-26 07:41:08', '2025-06-27 00:55:01'),
(31, 'Test', 'Test', 'test_test87', 'ssss@gmail.com', NULL, '$2y$12$3KC6v3Lr3tH1kFBLKtxv0eKyVOhS6RVqbRWeqQT3.avoGpzQ5k3vm', 1, 'Asia/Kolkata', 'IN', 2, NULL, 2, '[30,6]', NULL, '2025-06-06', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(546) 546-546', 0, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 1, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', '[{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"1\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"2\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"3\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"4\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"5\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"6\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"7\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"8\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"9\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"10\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"11\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"12\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"13\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"14\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"15\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"16\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"17\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"18\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"19\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"20\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"21\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"22\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"23\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"24\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"25\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"26\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"27\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"28\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"29\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"30\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"31\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"32\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"33\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"34\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"35\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"36\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"37\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"38\"},{\"view\":false,\"create\":true,\"update\":false,\"delete\":true,\"module_id\":\"39\"},{\"view\":true,\"create\":false,\"update\":true,\"delete\":false,\"module_id\":\"40\"}]', '[{\"allow_view_cost\":true},{\"allow_modify_pricing\":false}]', '[{\"limit_estimate_n_job_visibility\":true}]', '[{\"allow_users_create_jobs\":true},{\"allow_users_modify_own_time_log\":false},{\"allow_user_view_customer_detail\":true}]', '[{\"sunday\":{\"shift_start\":\"11:56\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"monday\":{\"shift_start\":\"\",\"shift_end\":\"23:55\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"tuesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"23:55\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"wednesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"thursday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"friday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"saturday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"}}]', NULL, NULL, '2025-06-27 00:56:03', '2025-06-27 00:56:20'),
(32, 'Rahul', 'Test', 'rahul_test30', 'rahul@gmail.com', NULL, '$2y$12$KQ0T0.b60soNgbOo8VQH7eAztgWe1jmDZqCTRRZz7OLMaMBOA/Q4S', 1, 'Asia/Kolkata', 'IN', 2, NULL, 1, '[26]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(567) 567-5676', 0, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', '[{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"1\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"2\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"3\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"4\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"5\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"6\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"7\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"8\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"9\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"10\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"11\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"12\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"13\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"14\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"15\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"16\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"17\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"18\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"19\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"20\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"21\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"22\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"23\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"24\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"25\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"26\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"27\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"28\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"29\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"30\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"31\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"32\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"33\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"34\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"35\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"36\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"37\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"38\"},{\"view\":false,\"create\":true,\"update\":false,\"delete\":true,\"module_id\":\"39\"},{\"view\":true,\"create\":false,\"update\":true,\"delete\":false,\"module_id\":\"40\"}]', '[{\"allow_view_cost\":true},{\"allow_modify_pricing\":false}]', '[{\"limit_estimate_n_job_visibility\":true}]', '[{\"allow_users_create_jobs\":true},{\"allow_users_modify_own_time_log\":false},{\"allow_user_view_customer_detail\":true}]', '[{\"sunday\":{\"shift_start\":\"11:56\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"monday\":{\"shift_start\":\"\",\"shift_end\":\"23:56\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"tuesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"23:55\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"wednesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"thursday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"friday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"saturday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"}}]', NULL, NULL, '2025-06-27 00:57:12', '2025-06-27 00:57:12'),
(39, 'Test', 'Sharma', 'test_sharma57', 'utest5452@gmail.com', NULL, '$2y$12$Hrwre1avNXDoyplTxkMXfe/ng3ORQLBdXE0ekkjiUJn19rRB4UHK6', 1, 'Asia/Kolkata', 'IN', 2, 6, 2, '[26,6]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(454) 353-4534', 0, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 1, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', '[{\"module_id\":\"1\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"2\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"3\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"4\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"5\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"6\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"7\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"8\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"9\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"10\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"11\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"12\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"13\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"14\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"15\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"16\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"17\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"18\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"19\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"20\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"21\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"22\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"23\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"24\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"25\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"26\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"27\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"28\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"29\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"30\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"31\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"32\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"33\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"34\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"35\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"36\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"37\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"38\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"39\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false},{\"module_id\":\"40\",\"view\":false,\"create\":false,\"update\":false,\"delete\":false}]', '[{\"allow_view_cost\":false},{\"allow_modify_pricing\":false}]', '[{\"limit_estimate_n_job_visibility\":false}]', '[{\"allow_users_create_jobs\":false},{\"allow_users_modify_own_time_log\":false},{\"allow_user_view_customer_detail\":false}]', '[{\"sunday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"monday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"tuesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"wednesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"thursday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"friday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"saturday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"}}]', NULL, NULL, '2025-06-27 02:39:06', '2025-06-27 02:39:40'),
(40, 'Test', 'Sharma', 'test_sharma47', 'f@gmail.com', NULL, '$2y$12$u.Z7T/1oUpRZL2ZDjsqHmOGVMm1mFU3FC3twPbQHuElndGrpxZSDW', 1, 'Asia/Kolkata', 'IN', 12, NULL, 2, '[26]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(334) 535-3453', 0, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', '[{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"1\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"2\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"3\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"4\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"5\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"6\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"7\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"8\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"9\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"10\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"11\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"12\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"13\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"14\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"15\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"16\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"17\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"18\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"19\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"20\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"21\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"22\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"23\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"24\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"25\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"26\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"27\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"28\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"29\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"30\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"31\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"32\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"33\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"34\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"35\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"36\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"37\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"38\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"39\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"40\"}]', '[{\"allow_view_cost\":false},{\"allow_modify_pricing\":false}]', '[{\"limit_estimate_n_job_visibility\":false}]', '[{\"allow_users_create_jobs\":false},{\"allow_users_modify_own_time_log\":false},{\"allow_user_view_customer_detail\":false}]', '[{\"sunday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"monday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"tuesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"wednesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"thursday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"friday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"saturday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"}}]', NULL, NULL, '2025-06-27 02:47:10', '2025-06-27 02:53:31'),
(41, 'Test', 'Test', 'test_test12', 'dsfdsf@gmail.com', NULL, '$2y$12$1nI61PzgLqP9hgRepOH1c.zEXZKARVgHbBkY9FtMXVH3V6M6OAPs.', 1, 'Asia/Kolkata', 'IN', 12, NULL, 2, '[26,6]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '(757) 575-6756', 0, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 'fds', 0, NULL, 'false', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'false', '[{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"1\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"2\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"3\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"4\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"5\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"6\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"7\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"8\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"9\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"10\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"11\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"12\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"13\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"14\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"15\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"16\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"17\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"18\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"19\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"20\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"21\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"22\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"23\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"24\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"25\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"26\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"27\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"28\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"29\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"30\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"31\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"32\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"33\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"34\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"35\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"36\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"37\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"38\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"39\"},{\"view\":false,\"create\":false,\"update\":false,\"delete\":false,\"module_id\":\"40\"}]', '[{\"allow_view_cost\":false},{\"allow_modify_pricing\":false}]', '[{\"limit_estimate_n_job_visibility\":false}]', '[{\"allow_users_create_jobs\":false},{\"allow_users_modify_own_time_log\":false},{\"allow_user_view_customer_detail\":false}]', '[{\"sunday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"monday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"tuesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"wednesday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"thursday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"friday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"},\"saturday\":{\"shift_start\":\"\",\"shift_end\":\"\",\"first_break_start\":\"\",\"first_break_end\":\"\",\"second_break_start\":\"\",\"second_break_end\":\"\",\"third_break_start\":\"\",\"third_break_end\":\"\"}}]', NULL, NULL, '2025-06-27 03:53:37', '2025-06-27 03:53:37');

-- --------------------------------------------------------

--
-- Table structure for table `user_documents`
--

CREATE TABLE `user_documents` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `doc_type_id` int(11) DEFAULT NULL,
  `doc_name` varchar(255) DEFAULT NULL,
  `doc_number` varchar(255) DEFAULT NULL,
  `doc_file` varchar(255) DEFAULT NULL,
  `doc_expiry_date` varchar(255) DEFAULT NULL,
  `doc_description` text DEFAULT NULL,
  `doc_notify_before_expiry` int(11) NOT NULL DEFAULT 0 COMMENT '0 => no , 1 => yes',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_documents`
--

INSERT INTO `user_documents` (`id`, `user_id`, `doc_type_id`, `doc_name`, `doc_number`, `doc_file`, `doc_expiry_date`, `doc_description`, `doc_notify_before_expiry`, `created_at`, `updated_at`) VALUES
(95, 29, 1, '1658714709AaronEmploymentAgreement.pdf', NULL, '1750920662_1658714709AaronEmploymentAgreement.pdf', NULL, NULL, 0, '2025-06-26 01:21:02', '2025-06-26 01:24:04'),
(98, 29, NULL, '1750853103_AZIP_Update_3-06-2025-16-06-2025_.docx', NULL, '1750940431_1750853103_AZIP_Update_3-06-2025-16-06-2025_.docx', NULL, NULL, 0, '2025-06-26 06:50:31', '2025-06-26 06:50:31'),
(99, 30, NULL, '1750940431_1750853103_AZIP_Update_3-06-2025-16-06-2025_.docx', NULL, '1750943468_1750940431_1750853103_AZIP_Update_3-06-2025-16-06-2025_.docx', NULL, NULL, 0, '2025-06-26 07:41:08', '2025-06-26 07:41:08'),
(100, 30, NULL, 'insert_permissions.sql', NULL, '1750943468_insert_permissions.sql', NULL, NULL, 0, '2025-06-26 07:41:08', '2025-06-26 07:41:08'),
(102, 30, NULL, 'Gemini_Generated_Image_g0iqn4g0iqn4g0iq.png', NULL, '1750943530_Gemini_Generated_Image_g0iqn4g0iqn4g0iq.png', NULL, NULL, 0, '2025-06-26 07:42:10', '2025-06-26 07:42:10'),
(103, 30, NULL, 'patient_PT-034.pdf', NULL, '1750944507_patient_PT-034.pdf', NULL, NULL, 0, '2025-06-26 07:58:27', '2025-06-26 07:58:27'),
(104, 31, NULL, '1750940431_1750853103_AZIP_Update_3-06-2025-16-06-2025_.docx', NULL, '1751005580_1750940431_1750853103_AZIP_Update_3-06-2025-16-06-2025_.docx', NULL, NULL, 0, '2025-06-27 00:56:20', '2025-06-27 00:56:20'),
(105, 31, NULL, '1750853631_permissions (1).sql', NULL, '1751005580_1750853631_permissions__1_.sql', NULL, NULL, 0, '2025-06-27 00:56:20', '2025-06-27 00:56:20'),
(106, 33, NULL, '1750940431_1750853103_AZIP_Update_3-06-2025-16-06-2025_.docx', NULL, '1751005686_1750940431_1750853103_AZIP_Update_3-06-2025-16-06-2025_.docx', NULL, NULL, 0, '2025-06-27 00:58:06', '2025-06-27 00:58:06'),
(107, 33, NULL, 'insert_permissions.sql', NULL, '1751005686_insert_permissions.sql', NULL, NULL, 0, '2025-06-27 00:58:06', '2025-06-27 00:58:06'),
(108, 33, NULL, '1658714709AaronEmploymentAgreement.pdf', NULL, '1751005686_1658714709AaronEmploymentAgreement.pdf', NULL, NULL, 0, '2025-06-27 00:58:06', '2025-06-27 00:58:06'),
(109, 35, NULL, '1751005686_1750940431_1750853103_AZIP_Update_3-06-2025-16-06-2025_.docx', NULL, '1751009859_1751005686_1750940431_1750853103_AZIP_Update_3-06-2025-16-06-2025_.docx', NULL, NULL, 0, '2025-06-27 02:07:39', '2025-06-27 02:07:39'),
(110, 35, NULL, '1658714709AaronEmploymentAgreement.pdf', NULL, '1751009859_1658714709AaronEmploymentAgreement.pdf', NULL, NULL, 0, '2025-06-27 02:07:39', '2025-06-27 02:07:39');

-- --------------------------------------------------------

--
-- Table structure for table `websockets_statistics_entries`
--

CREATE TABLE `websockets_statistics_entries` (
  `id` int(10) UNSIGNED NOT NULL,
  `app_id` varchar(255) NOT NULL,
  `peak_connection_count` int(11) NOT NULL,
  `websocket_message_count` int(11) NOT NULL,
  `api_message_count` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `oauth_access_tokens`
--
ALTER TABLE `oauth_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_access_tokens_user_id_index` (`user_id`);

--
-- Indexes for table `oauth_auth_codes`
--
ALTER TABLE `oauth_auth_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_auth_codes_user_id_index` (`user_id`);

--
-- Indexes for table `oauth_clients`
--
ALTER TABLE `oauth_clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_clients_user_id_index` (`user_id`);

--
-- Indexes for table `oauth_personal_access_clients`
--
ALTER TABLE `oauth_personal_access_clients`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `oauth_refresh_tokens`
--
ALTER TABLE `oauth_refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `oauth_refresh_tokens_access_token_id_index` (`access_token_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD KEY `password_resets_email_index` (`email`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `user_documents`
--
ALTER TABLE `user_documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `websockets_statistics_entries`
--
ALTER TABLE `websockets_statistics_entries`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=247;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `oauth_clients`
--
ALTER TABLE `oauth_clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `oauth_personal_access_clients`
--
ALTER TABLE `oauth_personal_access_clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `user_documents`
--
ALTER TABLE `user_documents`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `websockets_statistics_entries`
--
ALTER TABLE `websockets_statistics_entries`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
