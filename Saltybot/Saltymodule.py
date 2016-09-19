# Helper methods for selenium

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException

def clean_send_keys(text, element):
    element.click()
    element.clear()
    element.send_keys(text)

def check_exists_by_xpath(driver, xpath):
    try:
        driver.find_element_by_xpath(xpath)
    except NoSuchElementException:
        return False
    return True
