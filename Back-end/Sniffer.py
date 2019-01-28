import argparse
from scapy.all import *
import pytz
import datetime
from scapy.contrib.pnio import ProfinetIO
from bson.json_util import loads, dumps
#import confluent_kafka

packet_number = 0
berlin = pytz.timezone('Europe/Berlin')

# Check Options - interface, topic_name, filter
parser = argparse.ArgumentParser()
parser.add_argument("--interface", help="The interface to listen packets from.")
parser.add_argument("--filter", help="The BPF format to filter sniffed packets.")
args = parser.parse_args()

if args.interface:
    interface = args.interface
else:
    interface = "wlp3s0"

if args.filter:
    filter = args.filter
else:
    filter = "not(ether dst 00:00:00:00:00:00)"

# Produce RAW/bytes to Kafka topic
def produceRawPacket(packet):
    global packet_number
    packet_number += 1

    # get RAW byte string of packets
    raw=str(packet)
    #print(packet.show())
    #print str(packet[Ether].src)
    #print str(packet[Ether].dst)

    dissectToJSON(packet)



def dissectToJSON(raw_packet):
    # Convert RAW packet to scapy Ether packet
    ether_packet = Ether(raw_packet) #TODO: Change back to Ether(raw_packet)

    global packet_number
    packet_number += 1

    insertion_time = berlin.localize(datetime.datetime.now())

    L3Protocol = ''
    srcIP = ''
    dstIP = ''
    L4Protocol = ''
    srcPort = ''
    dstPort = ''

    if ether_packet.haslayer(ProfinetIO):
        L2Protocol = "Profinet"
    else:
        L2Protocol = "Ether"


        srcMAC = raw_packet[Ether].src
        dstMAC = raw_packet[Ether].dst

        #CAN THE ETHER PACKAGE EVER HAVE
    if raw_packet.haslayer(IP):
        L3Protocol = "IP"
        srcIP = raw_packet[IP].src
        dstIP = raw_packet[IP].dst
        protocol = raw_packet[IP].proto

        # IP Protocol Number: '6' -> TCP, '17' -> UDP
        # print(protocol)
        # print(pkt.show())

        if protocol == 6:
            L4Protocol = "TCP"
            srcPort = raw_packet[IP][TCP].sport
            dstPort = raw_packet[IP][TCP].dport
        elif protocol == 17:
            L4Protocol = "UDP"
            srcPort = raw_packet[IP][UDP].sport
            dstPort = raw_packet[IP][UDP].dport
        else:
            L4Protocol = ""
            srcPort = 0
            dstPort = 0

    dictPkt = {
        "PacketID": packet_number,
        "Timestamp" : insertion_time,
        "PacketSummary": ether_packet.summary(),
        "L2Protocol": L2Protocol,
        "SourceMACAddress": srcMAC,
        "DestinationMACAddress": dstMAC,
        "L3Protocol": L3Protocol,
        "SourceIPAddress": srcIP,
        "DestinationIPAddress": dstIP,
        "L4Protocol": L4Protocol,
        "SourcePort": srcPort,
        "DestinationPort": dstPort
    }


    # Serialize Dictionary to JSON
    jsonPkt = dumps( dictPkt )

    print(jsonPkt)

# TODO: Add filter
# sniff at intf1=interface, prn=produceJSONPacket
sniff(iface=interface, prn=produceRawPacket)

# Wait until all messages have been delivered
#print('%% Waiting for %d deliveries\n' % len(producer))
#producer.flush()
