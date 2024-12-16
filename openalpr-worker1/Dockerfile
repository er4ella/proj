FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopencv-dev \
    libtesseract-dev \
    libleptonica-dev \
    libcurl4-openssl-dev \
    wget \
    git \
    python3-pip \
    tzdata \
 && apt-get clean

RUN git clone https://github.com/openalpr/openalpr.git /openalpr && \
    cd /openalpr/src && \
    cmake . && \
    make && \
    make install && \
    ldconfig

WORKDIR /app

COPY worker.py .

RUN pip3 install pika minio

CMD ["python3", "worker.py"]