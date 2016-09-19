import Saltybettors
import sys, time

bettor_list = []

#Fill in e-mail and password for your saltybet acccount below. Able to add more bettors, but need selenium nodes with different IPs 
bettorB = Saltybettors.FixedWagerBlindBettor("EMAIL", "PASSWORD", True)
bettor_list.append(bettorB)
while True:
    for b in bettor_list:
        b.make_bet()    

# TODO: quit drivers on crash/program exit? 

