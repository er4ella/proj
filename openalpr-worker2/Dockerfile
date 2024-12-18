FROM node:16

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    cmake \
    libopencv-dev \
    libtesseract-dev \
    libleptonica-dev \
    libcurl4-openssl-dev \
    liblog4cplus-dev \
    wget \
    git \
    nodejs \
    npm \
 && apt-get clean

RUN git clone https://github.com/openalpr/openalpr.git /openalpr && \
    cd /openalpr/src && \
    cmake . && \
    make && \
    make install && \
    ldconfig

WORKDIR /app

COPY package.json .
RUN npm install
RUN npm install nodemailer

COPY worker2.js .

CMD ["node", "worker2.js"]