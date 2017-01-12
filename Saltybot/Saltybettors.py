import os, sys, re, time
from selenium import webdriver
from selenium.common.exceptions import TimeoutException, WebDriverException, ElementNotVisibleException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from Saltymodule import check_exists_by_css, clean_send_keys #, get_web_address
import SaltyDiscord
from pyvirtualdisplay import Display
from pymongo import MongoClient
class Saltybettor(object):
    # class variables shared among all Saltybettors
    client = MongoClient()
    db = client.saltydb
    bets_coll = db.bets
    chrome_driver_path = "/home/ubuntu/"
    salty_url = "https://www.saltybet.com/"
    #web_address = get_web_address()
    """description of class"""
    def __init__(self, username, password):
        self.current_balance = -1
        self.previous_balance = -1
        self.sleep_counter = 0
        self.username = username
        self.password = password
        self.display = Display(visible=0, size=(800,800))
        self.display.start()
        self.driver = webdriver.Chrome(Saltybettor.chrome_driver_path+"chromedriver")
        #self.driver = webdriver.Remote(command_executor='http://localhost:4444/wd/hub', desired_capabilities=DesiredCapabilities.CHROME)
        self.login(self.driver, self.username, self.password)
        self.current_balance = self.get_balance(self.driver)
        self.type = ""
        self.desc = ""
        print("Balance: " + "$" + str(self.current_balance))
        SaltyDiscord.build_message("Balance: " + "$" + str(self.current_balance))
        SaltyDiscord.send_message()
    def login(self, driver, username, password):
        try:
            timeout_secs = 300
            driver.get(Saltybettor.salty_url+"authenticate?signin=1")
            username_field = WebDriverWait(driver, timeout_secs).until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[id='email'][type='text']")))
            password_field = WebDriverWait(driver, timeout_secs).until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[id='pword'][type='password']")))
            clean_send_keys(username, username_field)
            clean_send_keys(password, password_field)
            submit = WebDriverWait(driver, timeout_secs).until(EC.presence_of_element_located((By.CSS_SELECTOR,"input[value='Sign In']")))
            submit.click()
            member_name_field = WebDriverWait(driver, timeout_secs).until(EC.presence_of_element_located((By.CSS_SELECTOR, "li.nav-image>h2>span.navbar-text")))
            self.name = member_name_field.text.split('(')[0].strip()
            self.pause_media()
            print(self.name + " logged in.")
            SaltyDiscord.build_message(self.name + " logged in.")
            #SaltyDiscord.build_message(Saltybettor.web_address)           
        except TimeoutException:
            print("Timeout logging in.")
            driver.close()

        #except:
        #    print("Unexpected error:", sys.exc_info()[0])
        #    driver.close()
        #    raise
    
    def pause_media(self):
        try:
            self.driver.execute_script("return document.getElementById('stream').innerHTML=\"\"")
            self.driver.execute_script("return document.getElementById('chat-wrapper').innerHTML=\"\"")
        except WebDriverException:
            print("Exception disabling media")

    def check_is_tournament(self):
        return (check_exists_by_css(self.driver, "span#tournament-note") or check_exists_by_css(self.driver, "span#balance[class *= 'purpletext']"))

    def get_balance(self, driver):
        timeout_secs = 1800
        balance_text = ""
        try:
            while True:
                balance_field = WebDriverWait(driver, timeout_secs).until(EC.presence_of_element_located((By.CSS_SELECTOR, "span#balance[class *= 'dollar']")))
                balance_text = str(balance_field.text).replace(',','')
                if re.search("[0-9]+",balance_text): # TODO: can you just add this check in the implicit wait above?
                    break
                time.sleep(1)
        except TimeoutException:
            print("Timeout waiting for balance field.")

        if re.search("[0-9]+",balance_text):
            return int(balance_text)
        else:
            print("Something weird happened when getting your balance: " + balance_text)
            time.sleep(10)
            return -1

    def input_bet_amount(self, driver, bet_amount):
        bet_timeout_secs = 1800

        try:
            wager_field = WebDriverWait(driver, bet_timeout_secs).until(EC.presence_of_element_located((By.CSS_SELECTOR, "input#wager[style *= 'inline']")))
            clean_send_keys(str(int(bet_amount)), wager_field)
        except TimeoutException:
            print("Timeout waiting for wager field.")

    def bet_player_red(self, driver):
        try:
            bet_timeout_secs = 1800
            red_button = WebDriverWait(driver, bet_timeout_secs).until(EC.presence_of_element_located((By.CSS_SELECTOR, "input#player1")))
            red_button.click()
        except ElementNotVisibleException:
            pass

    def bet_player_blue(self, driver):
        try:
            bet_timeout_secs = 1800
            blue_button = WebDriverWait(driver, bet_timeout_secs).until(EC.presence_of_element_located((By.CSS_SELECTOR, "input#player2")))
            blue_button.click()
        except ElementNotVisibleException:
            pass

    def check_bet_successful(self, driver):
        try:
            WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.CSS_SELECTOR, "span#betconfirm.greentext")))
        except TimeoutException:
            print("Not sure if bet made it in time.")
        else:
            print("Bet successful! Now waiting until next chance to bet.")

    def make_bet(self):
        if self.check_able_to_bet():
            self.display_bet_preparation()
            bet_decision_dict = self.bet_decision()
            bet_amount = bet_decision_dict['amount']
            print("This bot is going to bet $" + str(int(bet_amount)))
            SaltyDiscord.build_message("This bot is going to bet $" + str(int(bet_amount)))
            bet_side = bet_decision_dict['side']
            self.input_bet_amount(self.driver, bet_amount)
            if bet_side == True: # True = Red, False = Blue
                self.bet_player_red(self.driver)
            else:
                self.bet_player_blue(self.driver)
            self.check_bet_successful(self.driver)
            self.pause_media()
            #SaltyDiscord.build_message(Saltybettor.web_address)
            SaltyDiscord.send_message()
            date = os.popen('date +"%Y/%m/%d %H:%M"').read().rstrip('\n')
            Saltybettor.bets_coll.insert_one({"bettor_name":self.name, "bet_date":date, "balance":self.current_balance, "bet_amount":int(bet_amount), "is_tourney":self.check_is_tournament()})
        else:
            #print(self.name + " is sleeping 5 seconds because wager field is not present or because bet is already confirmed.")
            time.sleep(5)
            self.pause_media()
            self.sleep_counter += 1
            if(self.sleep_counter == 60):
                print(self.name + ": Waited too long for next match. Refreshing.")
                self.sleep_counter = 0
                self.driver.refresh()

    def check_able_to_bet(self):
        return (check_exists_by_css(self.driver, "input#wager[style *= 'inline']") and not check_exists_by_css(self.driver, "span#betconfirm.greentext"))

    def display_bet_preparation(self):
        print("====")
        print(self.name)
        SaltyDiscord.build_message(self.name)
        print("-> " + self.type)
        SaltyDiscord.build_message("-> " + self.type)
        print("-> " + self.desc)
        SaltyDiscord.build_message("-> " + self.desc)
        self.sleep_counter = 0
        self.previous_balance = self.current_balance
        self.current_balance = self.get_balance(self.driver)
        if(self.previous_balance != -1 and self.previous_balance == self.current_balance):
            print("Previous balance same as current balance. Refreshing page.")
            self.driver.refresh()
            self.current_balance = self.get_balance(self.driver)
            self.pause_media()
        print("Balance: $"+str(self.current_balance))
        SaltyDiscord.build_message("Balance: $"+str(self.current_balance))
        if self.check_is_tournament():
            print("Tournament Mode!")
            SaltyDiscord.build_message("Tournament Mode!")

    def bet_decision(self):
        return {}

class FixedWagerBlindBettor(Saltybettor):
    def __init__(self, username, password, side):
        Saltybettor.__init__(self, username, password)
        self.side = side
        if side == True: # True = Red, False = Blue
            self.type = "Betting style: Decreasing percentage, Betting Choice: Always Red"
            self.desc = "Bet more conservatively as balance increases, but always bet red"
        else:
            self.type = "Betting style: Decreasing percentage, Betting Choice: Always Blue"
            self.desc = "Bet more conservatively as balance increases, but always bet blue"
    def bet_decision(self):
        if not self.check_is_tournament():
            if self.current_balance < 1000:
                bet_multiplier = 1
            elif self.current_balance < 3000:
                bet_multiplier = 0.50 
            elif self.current_balance < 10000:
                bet_multiplier = 0.20
            elif self.current_balance < 20000:
                bet_multiplier = 0.10
            elif self.current_balance < 100000:
                bet_multiplier = 0.05
            else:
                bet_multiplier = 0.025
        else:
            if self.current_balance < 7000:
                bet_multiplier = 1
            elif self.current_balance < 30000:
                bet_multiplier = 0.30 
            else:
                bet_multiplier = 0.10
        
        return {'amount':self.current_balance*bet_multiplier, 'side':self.side}

