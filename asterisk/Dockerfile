FROM debian:bookworm

# Instalar todas las dependencias necesarias
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget build-essential libncurses5-dev libssl-dev libxml2-dev \
    uuid-dev libjansson-dev libsqlite3-dev ca-certificates pkg-config \
    bison flex doxygen git python3 \
    libedit-dev \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src

# Descargar y compilar Asterisk 22
RUN wget https://downloads.asterisk.org/pub/telephony/asterisk/asterisk-22-current.tar.gz && \
    tar -xzf asterisk-22-current.tar.gz && \
    cd asterisk-22.* && \
    ./configure && \
    make menuselect.makeopts && \
    make -j$(nproc) && \
    make install && \
    make samples && \
    make config && \
    ldconfig

# Copiar configuración
COPY conf/ /etc/asterisk/

EXPOSE 5060/udp
EXPOSE 10000-10100/udp

CMD ["asterisk", "-f", "-U", "root"]
