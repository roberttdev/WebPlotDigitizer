#!bin/bash

#This script assumes Nginx is already installed at /etc/nginx

sudo apt-get install -y php5-fpm php5 python-jinja2

sudo chmod g+x, o+x /srv/www/WebPlotDigitizer

sudo cp /srv/www/WebPlotDigitizer/config/WebPlotDigitizer.conf /etc/nginx/sites-enabled

sudo service nginx restart