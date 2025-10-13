-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           12.0.2-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para console
CREATE DATABASE IF NOT EXISTS `console` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `console`;

-- Copiando estrutura para tabela console.people
CREATE TABLE IF NOT EXISTS `people` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `cpf` varchar(20) DEFAULT NULL,
  `sexo` char(1) DEFAULT NULL,
  `data_nascimento` varchar(20) DEFAULT NULL,
  `mae` varchar(255) DEFAULT NULL,
  `pai` varchar(255) DEFAULT NULL,
  `parentes` text DEFAULT NULL,
  `endereco` text DEFAULT NULL,
  `telefone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela console.people: ~24 rows (aproximadamente)
INSERT INTO `people` (`id`, `nome`, `cpf`, `sexo`, `data_nascimento`, `mae`, `pai`, `parentes`, `endereco`, `telefone`) VALUES
	(1, 'JHON RAMIRES LOURENÇO BUENO', 'Sem Informação', 'M', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(2, 'SAMUEL SYRAYAMA EVANGELISTA SANTOS', '09212992900', 'M', '07/08/2008', 'CRISTINA SYRAYAMA EVANGELISTA', 'CALVI CONCEIÇÃO DOS SANTOS', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(3, 'CRISTINA SYRAYAMA EVANGELISTA', '87319101904', 'F', '08/10/1973', 'RENEE SYRAYAMA EVANGELISTA', 'JOSE ROBERTO EVANGELISTA', 'IRMA(O): ALESSANDRA SYRAYAMA EVANGELISTA', 'Sem Informação', 'Sem Informação'),
	(4, 'JOAO PEDRO MELEGA VIDAL', '09478643932', 'M', '11/03/2010', 'JOCELAINE DE QUEIROZ MELEGA', 'EDCLEI CEZARIO VIDAL', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(5, 'CARLOS HENRIQUE DE OLIVEIRA LOPES', '11360210946', 'M', '28/09/2009', 'EZILDA SOARES DE OLIVEIRA LOPES', 'ERICK DOS PASSOS LOPES', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(6, 'IZAQUE DA CRUZ MASBA', '10776580957', 'M', '07/05/2008', 'PRISCILA MARIA BARBOZA', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(7, 'ANDRE LUCAS FERNANDES WENDLER', '12119740909', 'M', '30/09/2010', 'SIMONE ASTRAIT FERNANDES', 'LEONARDO CALDONAZO WENDLER', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(8, 'LUIZ GUILHERME GUEDES WEBER', '14861436958', 'M', '20/05/2010', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(9, 'NYCOLAS THEULEN SOARES RAMOS', '14172162983', 'M', '19/04/2010', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(10, 'VICTOR HUGO FALCAO COSTA', '15418586971', 'M', '22/01/2008', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(11, 'DANIEL ALEXANDER MOROCOIMA BARRETO', '70797866221', 'M', '29/03/2010', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(12, 'ISABELLA ALESSANDRA DUARTE SANTOS', '14298207994', 'F', '07/08/2010', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(13, 'JUNIOR JOSE GONCALVES', '13735461905', 'M', '06/12/2010', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação', 'Sem Informação'),
	(14, 'MARCELO DEL RIO', '18644572873', 'M', '17/05/1973', 'NILZA GOMES DEL RIO', '', '', 'Rua Rodolfo Bernardelli, 425 - Uberaba - CURITIBA - PR', '(41) 99923-4070 (POSSIBILIDADE 50%)'),
	(15, 'THAISA BOLINO GONCALVES', '06663020900', 'F', '08/03/1996', 'MARISA DO ROCIO BOLINO', '', 'IRMA(O): HELLEN CRISLEY RIBASKI, NAMORADO: RAPHAEL CHRISTIAN CORDEIRO DO CARMO', '', '(41) 9527-1826 (POSSIBILIDADE 50%)'),
	(16, 'HELLEN CRISLEY RIBASKI', '06663024990', 'F', '14/08/1991', 'MARISA DO ROCIO BOLINO', 'ANTONIO CARLOS RIBASKI', 'IRMA(O): THAISA BOLINO GONCALVES', 'R CARMEM MIRANDA 238 AP 1 - PRQ DA FONTE - SAO JOSE DOS PINHAIS/PR - 83050-370', '(41) 9527-1826 (POSSIBILIDADE 50%)'),
	(17, 'RAPHAEL CHRISTIAN CORDEIRO DO CARMO', '08526493981', 'M', '19/08/1994', 'ALICE APARECIDA CORDEIRO DO NASCIMENTO', 'ANTONIO CARLOS RIBASKI', 'NAMORADA: THAISA BOLINO GONCALVES, IRMA(O): ANNE CINTYA CORDEIRO CARMO DA COSTA, AVÓ(Ô): IOLANDA MACIEL, IRMA(O): VIVIANE CAMILA CORDEIRO DO CARMO', 'R CD DE SAO JOAO DAS DOIS BARRAS 2300 - BOQUEIRAO - CURITIBA/PR - 81670-170', '(41) 99747-5386 (POSSIBILIDADE 100%)'),
	(18, 'CRISTIANE GREBOGE DE FREITAS', '02825819956', 'F', '14/05/1979', 'EULALIA GREBOGE', 'VICENTE RENATO GREBOGE', '', 'RUA CORONEL JOSE CARVALHO DE OLIVIERA 539 CASA, CURITIBA - PR, 81570160', '41 9760-9172 (POSSIBILIDADE 100%)'),
	(19, 'FERNANDA DE PAULA COELHO', '04358005900', 'F', '26/12/1984', 'GISELA MARIA STEFF COELHO', 'FRANCISCO DE ASSIS COELHO', '', '', '41 9865-1756 (POSSIBILIDADE 100%)'),
	(20, 'ENIO MARCONDES DE CAMPOS', '04192428997', 'M', '09/01/1983', 'SIONI MARCONDES DE CAMPOS', 'JOEL CORREA DE CAMPOS', '', '', ''),
	(21, 'PABLO ALESSANDRO MARTINEZ CORREA', '72505664900', 'M', '18/05/1969', 'RUTH MARTINEZ CORREA', '', '', '', '(41) 99973-0441 (POSSIBILIDADE 40%)'),
	(22, 'DULCINER FERREIRA GLIR', '59801069953', 'F', '10/04/1966', 'MARIA GUILHERMINA DA SILVA', 'ANTONIO FERREIRA DA SILVA', '', 'Rua Valentim Bokowski, 62 - Guabirotuba', ''),
	(23, 'ELIECE AMORIM DE FRANCA', '87735741987', 'F', '08/09/1972', 'MARIA JOSE DE JESUS AMORIM', '', '', 'R. Luiz França, 585 - Cajuru - CURITIBA/PR', '(41) 999787637 / (41) 99688-0377 (POSSIBILIDADE 90%)'),
	(24, 'LUIZ EDUARDO CORDEIRO', '31814492968', 'M', '22/08/1957', 'SYLVIA KLOS CORDEIRO', 'MANOEL VRISSIMO CORDEIRO', 'IRMA(O): ROSANE CELIA CORDEIRO, IRMA(O): MARCOS ANTONIO CORDEIRO', '', '(41) 98827-8955 (POSSIBILIDADE 100%)');

-- Copiando estrutura para tabela console.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) DEFAULT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `password_hash` varchar(512) DEFAULT NULL,
  `is_admin` tinyint(4) DEFAULT 0,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `expiration` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela console.users: ~1 rows (aproximadamente)
INSERT INTO `users` (`id`, `username`, `nome`, `password_hash`, `is_admin`, `status`, `expiration`) VALUES
	(1, 'admin', 'System Administrator', '2db327168036a85109a2b5cd35dd4aeb7207ecf4658814d2a7a8ee754084793d$6c6b4a495ac180e241f6a804dc63da6f', 1, 'ACTIVE', NULL);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
