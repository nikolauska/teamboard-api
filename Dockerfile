FROM dockerfile/nodejs

MAINTAINER n4sjamk

RUN ["useradd", "-m", "teamboard"]

ADD . /home/teamboard/teamboard-api

RUN cd /home/teamboard/teamboard-api && \
	npm install && \
	chown -R teamboard:teamboard .
