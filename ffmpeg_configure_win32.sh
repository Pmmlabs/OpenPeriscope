# OpenSSL:
#./Configure mingw no-shared no-asm --cross-compile-prefix=i686-w64-mingw32- --prefix=`pwd`/dist
OPENSSL="./openssl-1.0.1t/dist/"
./configure --pkg-config=pkg-config --enable-memalign-hack --arch=x86 --target-os=mingw32 --disable-w32threads --cross-prefix=i686-w64-mingw32- --extra-cflags="-I${OPENSSL}include" --extra-ldflags="-L${OPENSSL}lib" \
--disable-debug \
--disable-programs \
--enable-ffmpeg \
--disable-doc \
--disable-encoders \
--disable-decoders \
--disable-hwaccels \
--disable-demuxers \
--disable-muxers \
--disable-parsers \
--disable-bsfs \
--disable-devices \
--disable-filters \
--disable-protocols \
--enable-protocol=hls,http,https,tcp,tls_gnutls,file \
--enable-openssl \
--enable-decoder=h264,aac \
--enable-demuxer=hls,mpegts,dnxhd \
--enable-muxer=mp4 \
--enable-parser=h264,aac \
--enable-bsf=aac_adtstoasc
