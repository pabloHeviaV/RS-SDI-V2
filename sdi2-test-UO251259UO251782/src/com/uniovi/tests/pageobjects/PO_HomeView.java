package com.uniovi.tests.pageobjects;

import org.openqa.selenium.WebDriver;

import com.uniovi.tests.utils.SeleniumUtils;

public class PO_HomeView extends PO_NavView {

	static public void checkWelcome(WebDriver driver) {
		// Esperamos a que se cargue el saludo de bienvenida en Espa�ol
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Bienvenidos a la página principal", getTimeout());
	}


}
