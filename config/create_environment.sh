#!bin/bash

#This script assumes Nginx is already installed at /etc/nginx

sudo apt-get install -y php5-fpm php5 python-jinja2

sudo chmod -R u+rwX,go+rX,go-w /srv/www/WebPlotDigitizer

sudo cp /srv/www/WebPlotDigitizer/config/WebPlotDigitizer.conf /etc/nginx/sites-enabled

sudo service nginx restart