#!/bin/sh
sudo forever stop chatapp
forever stop hubot
GIT_WORK_TREE=/home/ec2-user/chatapp
export GIT_WORK_TREE
git checkout -f
sudo forever start -a -o /home/ec2-user/logs/chatout.log -e /home/ec2-user/logs/chaterr.log -l /home/ec2-user/logs/chat.log --uid "chatapp" --sourceDir "/home/ec2-user/chatapp/server" server.js
cd /home/ec2-user/hubot/node_modules/hubot
forever start -a -o /home/ec2-user/logs/hubotout.log -e /home/ec2-user/logs/huboterr.log -l /home/ec2-user/logs/hubot.log --uid "hubot" --sourceDir "/home/ec2-user/hubot/node_modules/hubot" ../coffee-script/bin/coffee bin/hubot -a chatapp