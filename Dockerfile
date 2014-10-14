FROM dockerfile/nodejs

MAINTAINER n4sjamk

RUN ["useradd", "-m", "teamboard"]

ADD . /home/teamboard/teamboard-api

RUN cd /home/teamboard/teamboard-api && \
	npm install && \
	chown -R teamboard:teamboard .

CMD /usr/bin/sudo -u teamboard -E /usr/local/bin/node /home/teamboard/teamboard-api/index.js
