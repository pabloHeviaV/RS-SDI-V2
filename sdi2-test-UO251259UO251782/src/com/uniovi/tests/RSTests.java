package com.uniovi.tests;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.uniovi.tests.pageobjects.PO_FriendRequestListView;
import com.uniovi.tests.pageobjects.PO_HomeView;
import com.uniovi.tests.pageobjects.PO_LoginView;
import com.uniovi.tests.pageobjects.PO_RegisterView;
import com.uniovi.tests.pageobjects.PO_UserListView;
import com.uniovi.tests.pageobjects.PO_View;

//Ordenamos las pruebas por el nombre del m�todo
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class RSTests {

	// Antes de cada prueba se navega al URL home de la aplicaci�nn
	@Before
	public void setUp() {
		driver.navigate().to(URL);
	}

	// Despu�s de cada prueba se borran las cookies del navegador
	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	// Antes de la primera prueba se reinicia la bd
	@BeforeClass
	static public void begin() {
		driver.navigate().to(URL + "/borrarDB");
	}

	// Al finalizar la �ltima prueba
	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	// En Windows (Debe ser la versi�n 46.0 y desactivar las actualizacioens
	// autom�ticas)):
	//static String PathFirefox = "C:\\Users\\yo\\Desktop\\SDI\\entorno-sdi\\entorno-sdi\\firefox\\FirefoxPortable.exe";
	static String PathFirefox = "C:\\Firefox46.win\\FirefoxPortable.exe";
	static WebDriver driver = getDriver(PathFirefox);
	static String URL = "http://localhost:8081";

	public static WebDriver getDriver(String PathFirefox) {
		// Firefox (Versi�n 46.0) sin geckodriver para Selenium 2.x.
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}
	
	// 1.1 [RegVal] Registro de Usuario con datos válidos.
	@Test
	public void PR1_1() {
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "7@uniovi.es", "Pablo", "Menendez", "123456", "123456");
		PO_LoginView.checkKey(driver, "Identificación de usuario");
	}

	// 1.2 [RegInval] Registro de Usuario con datos inválidos (repetición de
	// contraseña invalida).
	@Test
	public void PR1_2() {
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "8@uniovi.es", "Sara", "Grimaldos", "123456", "123453");
		PO_RegisterView.checkKey(driver, "Las claves no coinciden");
	}

	// 2.1 [InVal] Inicio de sesión con datos válidos.
	@Test
	public void PR2_1() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "7@uniovi.es", "123456");
		PO_LoginView.checkKey(driver, "Usuarios");
	}

	// 2.2 [InInVal] Inicio de sesión con datos inválidos (usuario no existente en
	// la aplicación).
	@Test
	public void PR2_2() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "9@uniovi.es", "123456");
		PO_LoginView.checkKey(driver, "Email o password incorrecto");
	}

	// 3.1 [LisUsrVal] Acceso al listado de usuarios desde un usuario en sesión.
	@Test
	public void PR3_1() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "7@uniovi.es", "123456");
		PO_LoginView.checkKey(driver, "Usuarios");
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id,'users-menu')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/user/list')]");
		PO_LoginView.checkKey(driver, "Los usuarios que actualmente figuran en el sistema son los siguientes:");
	}

	// 3.2 [LisUsrInVal] Intento de acceso con URL desde un usuario no identificado
	// al
	// listado de usuarios desde un usuario en sesión.
	// Debe producirse un acceso no permitido a vistas privadas.
	@Test
	public void PR3_2() {
		driver.navigate().to("http://localhost:8081/user/list");
		PO_LoginView.checkKey(driver, "Identificación de usuario");
	}

	// 4.1 [BusUsrVal] Realizar una búsqueda válida en el listado de
	// usuarios desde un usuario en sesión.
	@Test
	public void PR4_1() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "7@uniovi.es", "123456");
		PO_UserListView.search(driver, "Pablo");
		PO_View.checkElement(driver, "text", "Pablo");
	}

	// 4.2 [BusUsrInVal] Intento de acceso con URL a la búsqueda de usuarios desde
	// un usuario no identificado. Debe producirse un acceso no permitido a vistas
	// privadas.
	@Test
	public void PR4_2() {
		// Intentamos acceder a una url privada sin identificarnos
		driver.navigate().to("http://localhost:8081/user/list?busqueda=Pablo");
		// Nos devuelve a la página de login
		PO_LoginView.checkKey(driver, "Identificación de usuario");
	}

	// 5.1 [InvVal] Enviar una invitación de amistad a un usuario de forma valida.
	@Test
	public void PR5_1() {
		//Registramos dos usuarios
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "1@uniovi.es", "Maria", "Suarez", "123456", "123456");
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "2@uniovi.es", "Paula", "Gonzalez", "123456", "123456");
		
		// Nos logueamos
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "1@uniovi.es", "123456");
		// Enviamos una solicitud al usuario 2
		PO_UserListView.sendFriendRequest(driver, "2@uniovi.es");
		// Nos deslogueamos
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");

		// Nos logueamos como el usuario 2
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "2@uniovi.es", "123456");
		// Nos deslogueamos

		// Vamos a la lista de solicitudes
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id, 'fr-menu')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'friendRequest/list')]");
		elementos.get(0).click();

		// Comprobamos que hay una solicitud del usuario 1
		PO_View.checkElement(driver, "text", "1@uniovi.es");

	}

	// 5.2 [InvInVal] Enviar una invitación de amistad a un usuario al que ya le
	// habíamos invitado la invitación previamente. No debería dejarnos enviar la
	// invitación, se podría ocultar el botón de enviar invitación o notificar que
	// ya había sido enviada previamente.
	@Test
	public void PR5_2() {
		// Nos logueamos
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "1@uniovi.es", "123456");
		
		// Comprobamos que la petición ya había sido enviada
		PO_View.checkElement(driver, "text", "Petición enviada");
	}
	
	// 6.1 [LisInvVal] Listar las invitaciones recibidas por un usuario, realizar la
	// comprobación con una lista que al menos tenga una invitación recibida.
	@Test
	public void PR6_1() {
		// Nos logueamos con el usuario 2 que tiene 1 peticion de amistad
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "2@uniovi.es", "123456");

		// Vamos a la lista de solicitudes
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id, 'fr-menu')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'friendRequest/list')]");
		elementos.get(0).click();

		// Comprobamos que entramos en la página de las solicitudes de amistad
		PO_View.checkElement(driver, "text", "Solicitudes de amistad");
		// Contamos el número de filas de solicitudes
		List<WebElement> filas = PO_View.checkElement(driver, "free", "//tbody/tr");
		assertTrue(filas.size() == 1);

	}
	
	// 7.1 [AcepInvVal] Aceptar una invitación recibida.
	@Test
	public void PR7_1() {
		// Nos logueamos con el usuario 2 que tiene 1 peticion de amistad
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "2@uniovi.es", "123456");

		// Vamos a la lista de solicitudes
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id, 'fr-menu')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, 'friendRequest/list')]");
		elementos.get(0).click();

		// Comprobamos que entramos en la página de las solicitudes de amistad
		PO_View.checkElement(driver, "text", "Solicitudes de amistad");

		// Aceptamos la petición de amistad
		PO_FriendRequestListView.acceptFriendRequest(driver, "1@uniovi.es");

		// Vamos a la lista de amigos
		elementos = PO_View.checkElement(driver, "free", "//li[contains(@id, 'friends-menu')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/friendship/list')]");
		elementos.get(0).click();

		// Comprobamos que está el usuario 1
		PO_View.checkElement(driver, "text", "1@uniovi.es");
	}
	
	// 8.1 [ListAmiVal] Listar los amigos de un usuario, realizar la comprobación
	// con una lista que al menos tenga un amigo.
	@Test
	public void PR8_1() {
		// Nos logueamos con el usuario 1 que tiene 1 amigo
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "1@uniovi.es", "123456");

		// Vamos a la lista de solicitudes
		List<WebElement> elementos = PO_View.checkElement(driver, "free", "//li[contains(@id, 'fr-menu')]/a");

		// Vamos a la lista de amigos
		elementos = PO_View.checkElement(driver, "free", "//li[contains(@id, 'friends-menu')]/a");
		elementos.get(0).click();
		elementos = PO_View.checkElement(driver, "free", "//a[contains(@href, '/friendship/list')]");
		elementos.get(0).click();

		// Contamos que tiene 1 amigo
		List<WebElement> filas = PO_View.checkElement(driver, "free", "//tbody/tr");
		assertTrue(filas.size() == 1);
	}

}
