FROM node:14.16.1-alpine As builder
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod --base-href

FROM nginx:latest
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /usr/src/app/dist/CronDataFrontend .
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
