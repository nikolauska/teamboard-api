FROM dockerfile/nodejs

MAINTAINER n4sjamk

RUN ["useradd", "-m", "teamboard", "-u", "23456"]

ADD . /home/teamboard/teamboard-api

RUN cd /home/teamboard/teamboard-api && \
	npm install && \
	chown -R teamboard:teamboard .

RUN ["sudo", "-u", "teamboard", "mkdir", "/home/teamboard/logs"]

USER teamboard
CMD /usr/local/bin/node /home/teamboard/teamboard-api/index.js \
	2>> /home/teamboard/logs/teamboard-api.err \
	1>> /home/teamboard/logs/teamboard-api.log
