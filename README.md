
# Using ngrok with wordpress

This little guide is written to tunnel our wordpress sites using ngrok. The following components will be changed during this tutorial;
* nginx config
* hosts.yml
* ngrok.yml
* wordpress plugin called 'Simple SSL'
* wordpress' database entries

## 1 - Change `ngrok.yml` file
We should begin the process with changing the ngrok yml file. You need to add  the following **two entries** to the ngrok.yml file; 
```yml
  hhwplocal-http:
    addr: 192.168.95.100:80 #points directly to the wordpress site
    proto: http
    hostname: "hhwplocal.ftops1.holidayhype.co.uk"
    bind_tls: false
  hhwplocal:
    addr: 192.168.95.100:80
    proto: tls
    hostname: "hhwplocal.ftops1.holidayhype.co.uk"
    crt: multi-subdomain-wildcard-holidayhype-co-uk.crt
    key: multi-subdomain-wildcard-holidayhype-co-uk.key 
``` 
The `addr` property's value should equal to the value from `hosts.yml`. Refer to the code below.
```yml
## Local by Flywheel - Start ##
192.168.95.100 hhwplocal.ftops1.holidayhype.co.uk #Local Site
192.168.95.100 www.hhwplocal.ftops1.holidayhype.co.uk #Local Site
## Local by Flywheel - End ##
```

## 2 - Amend `hosts.yml` file
At the bottom of your `hosts.yml` file, you need to comment out the ip references to your local site. This is to make sure that we are delegating the redirecting work to ngrok as opposed to flywheel. Use the code below as a reference
```yml
## Local by Flywheel - Start ##
#192.168.95.100 hhwplocal.ftops1.holidayhype.co.uk #Local Site
#192.168.95.100 www.hhwplocal.ftops1.holidayhype.co.uk #Local Site
## Local by Flywheel - End ##
```
The ips need to be commented out here.

## 3 - Uninstall "Really Simple SSL" Plugin
Inside your wordpress' wp-admin we need to disable the Really Simple SSL plugin which causes redirects. 
Open your admin console `/wp-admin` and follow the steps below.

-> Open Plugins
-> Find Plugin called "Really Simple SSL"
-> Deactivate

You might need to restart your flywheel. 

## 4 - Adminer Database Change
We need to ensure that our home and site urls are using `https` protocols. We can check that by going into adminer console and changing the relative entries. 

Open Flywheel then follow the steps below.
-> Select `Database` tab
-> Next to **'Connect'**, click `ADMINER`

Once inside the adminer;
-> Click `wp_options`
-> Click `Select data` tab

You should now see a list of fields corresponding to the wordpress site. You now need to locate and edit the `siteurl` and `home` option names. The urls for those need to be prefixed with `https://`. 

## 5 - `nginx` changes in Oracle Box
This step is used to make sure that when 
Open Oracle VM VirtualBox manager and follow the steps below.

* In the command line, type `docker ps -a`
* You should see two containers, one of them is a `flywheel` container and the second one is `nginx`. Each one of those will have an associated name with the container. For example, mine are; `nifty_booth` and `elastic_brahmagupta`.
	* Once you located the name for the nginx container, you need to enter it by typing the following command; `docker exec -it container_name /bin/sh` *(my container name was elastic_brahmagupta)*. You will be able to tell if you are inside the container by seeing a **#** next to your cursor or by typing `ls`. 
* Once inside the container, you need to navigate to the folder where the **.conf** lives, use this command to get there; `cd /etc/nginx` 
* Use `vi location-block.conf` command to open the configuration file
* Inside location-block.conf locate a proxy set header called `X-Forwarded-Proto` and chance its value to **`https`**
* To save, press ESC twice -> then Shift + Colon -> then at prompt type `:wq!`
* Once close the file, type `exit`, this will take you to the root directory of your virtual machine
* We now just need to retstart the container, use this command to do it; `docker restart container_name`
