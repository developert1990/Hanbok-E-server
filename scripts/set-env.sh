#!/bin/bash

echo $JWT_SECRET > .env
echo $PORT >> .env
echo $PAYPAL_CLIENT_ID >> .env
echo $GOOGLE_API_KEY >> .env
echo $EMAIL >> .env
echo $EMAIL_PASSWORD >> .env
echo $MONGODB_URL >> .env