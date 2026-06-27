import datetime
from netmiko import ConnectHandler

target_router = {
    'device_type': 'cisco_ios',
    'host': '192.168.1.1',  
    'username': 'admin',
    'password': 'Password123',
}

def backup_network_node():
    try:
        print(f"Connecting to backbone node {target_router['host']}...")
        ssh_session = ConnectHandler(**target_router)
        
        # Execute the core engineering backup command
        running_config = ssh_session.send_command('show running-config')
        
        # Generate a timestamped archive file
        today = datetime.date.today()
        filename = f"config_backup_{target_router['host']}_{today}.txt"
        
        with open(filename, 'w') as backup_file:
            backup_file.write(running_config)
            
        print(f"Success! State configuration archived cleanly to: {filename}")
        ssh_session.disconnect()
        
    except Exception as error:
        print(f"Connection baseline dropped. Operational failure details: {error}")

if __name__ == "__main__":
    backup_network_node()
