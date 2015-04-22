FROM library/ubuntu:14.04

MAINTAINER n4sjamk

RUN apt-get update && apt-get install -y software-properties-common build-essential python
RUN add-apt-repository ppa:chris-lea/node.js
RUN apt-get update && apt-get install -y nodejs

RUN ["useradd", "-m", "teamboard", "-u", "23456"]

ADD . /home/teamboard/teamboard-api

RUN chown -R teamboard:teamboard /home/teamboard/teamboard-api

USER teamboard

RUN cd /home/teamboard/teamboard-api && \
	npm install

RUN ["mkdir", "/home/teamboard/logs"]

CMD /usr/local/bin/node /home/teamboard/teamboard-api/index.js \
	2>> /home/teamboard/logs/teamboard-api.err \
	1>> /home/teamboard/logs/teamboard-api.log
