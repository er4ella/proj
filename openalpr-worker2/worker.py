import time
import pika
from minio import Minio
import subprocess

# Minio клиент
minio_client = Minio("minio:9000", access_key="admin", secret_key="password", secure=False)
arrival_times = {}

def callback(ch, method, properties, body):
    file_name = body.decode()
    print(f"Processing: {file_name}")

    print("Departure time logged.")

connection = pika.BlockingConnection(pika.ConnectionParameters("rabbitmq"))
channel = connection.channel()
channel.queue_declare(queue="fileQueue")
channel.basic_consume(queue="fileQueue", on_message_callback=callback, auto_ack=True)

print("Worker 2 started.")
channel.start_consuming()