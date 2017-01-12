# Helper methods for selenium

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
import os, re
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

def check_exists_by_css(driver,css_selector):
    try:
        driver.find_element_by_css_selector(css_selector)
    except NoSuchElementException:
        return False
    return True

def get_web_address():
	public_ip=os.popen('wget http://ipinfo.io/ip -qO - | sed s/\\\\./-/g').read().rstrip('\n')
	region=os.popen('cat /etc/resolv.conf | grep us').read().rstrip('\n').split(' ')[1].split('.')[0]
	return "ec2-" + public_ip + "." + region + ".compute.amazonaws.com:3007/bethistory"

