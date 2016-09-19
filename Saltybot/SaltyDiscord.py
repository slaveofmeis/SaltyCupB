import requests, time

# Input your info in these first three fields. You can get the last two programatically, but just hard code for ease
bot_token = ""
bot_id = ""
channel_id = ""

base_uri = "https://discordapp.com/api/"
header = {'Authorization': 'Bot ' + bot_token, 'Content-Type': 'application/json'}
built_message = ""

#TODO: accomplish without global variable by making this into class

def send_message():
    global built_message
    payload = "{ \"content\":\"" + built_message + "**---**\" }"
    #print(payload)
    r = requests.post(base_uri+"/channels/" + channel_id + "/messages", data=payload, headers=header) 
    built_message = ""
    #print(r.text)

def build_message(message):
    global built_message
    if built_message:
        built_message = built_message + "```" + message + "```"
    else:
        built_message = "```" + message + "```"

