/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.records;

import java.util.Date;

/**
 * Inheriting from Record, this class contains attributes that match the json
 * string obtained from MongoDB.
 * 
 * The attributes of this class therefore correspond to the data format for the
 * ADIN framework's raw data.
 * 
 * This class has a setter and getter method for every attribute.
 */

public class PacketRecordDesFromMongo extends Record {

	private String L2Protocol;
	private String SourceMACAddress;
	private String L4Protocol;
	private String SourceIPAddress;
	private String PacketSummary;
	private String PacketID;
	private String DestinationIPAddress;
	private Date Timestamp;
	private String DestinationPort;
	private String SourcePort;
	private String L3Protocol;
	private String DestinationMACAddress;

	//MOCK RECORD
	public PacketRecordDesFromMongo()
	{

	}

	/**
	 * Constructor to initialize all attributes.
	 * @param l2Protocol initial value
	 * @param sourceMACAddress initial value
	 * @param l4Protocol initial value
	 * @param sourceIPAddress initial value
	 * @param packetSummary initial value
	 * @param packetID initial value
	 * @param destinationIPAddress initial value
	 * @param timestamp initial value
	 * @param destinationPort initial value
	 * @param sourcePort initial value
	 * @param l3Protocol initial value
	 * @param destinationMACAddress initial value
	 */
	public PacketRecordDesFromMongo(String l2Protocol, String sourceMACAddress, String l4Protocol, String sourceIPAddress, String packetSummary, String packetID, String destinationIPAddress, Date timestamp, String destinationPort, String sourcePort, String l3Protocol, String destinationMACAddress) {
		L2Protocol = l2Protocol;
		SourceMACAddress = sourceMACAddress;
		L4Protocol = l4Protocol;
		SourceIPAddress = sourceIPAddress;
		PacketSummary = packetSummary;
		PacketID = packetID;
		DestinationIPAddress = destinationIPAddress;
		Timestamp = timestamp;
		DestinationPort = destinationPort;
		SourcePort = sourcePort;
		L3Protocol = l3Protocol;
		DestinationMACAddress = destinationMACAddress;
	}


	public String getL2Protocol() {
		return L2Protocol;
	}

	public void setL2Protocol(String l2Protocol) {
		L2Protocol = l2Protocol;
	}

	public String getSourceMACAddress() {
		return SourceMACAddress;
	}

	public void setSourceMACAddress(String sourceMACAddress) {
		SourceMACAddress = sourceMACAddress;
	}

	public String getL4Protocol() {
		return L4Protocol;
	}

	public void setL4Protocol(String l4Protocol) {
		L4Protocol = l4Protocol;
	}

	public String getSourceIPAddress() {
		return SourceIPAddress;
	}

	public void setSourceIPAddress(String sourceIPAddress) {
		SourceIPAddress = sourceIPAddress;
	}

	public String getPacketSummary() {
		return PacketSummary;
	}

	public void setPacketSummary(String packetSummary) {
		PacketSummary = packetSummary;
	}

	public String getPacketID() {
		return PacketID;
	}

	public void setPacketID(String packetID) {
		PacketID = packetID;
	}

	public String getDestinationIPAddress() {
		return DestinationIPAddress;
	}

	public void setDestinationIPAddress(String destinationIPAddress) {
		DestinationIPAddress = destinationIPAddress;
	}

	public Date getTimestamp() {
		return Timestamp;
	}

	public void setTimestamp(Date timestamp) {
		Timestamp = timestamp;
	}

	public String getDestinationPort() {
		return DestinationPort;
	}

	public void setDestinationPort(String destinationPort) {
		DestinationPort = destinationPort;
	}

	public String getSourcePort() {
		return SourcePort;
	}

	public void setSourcePort(String sourcePort) {
		SourcePort = sourcePort;
	}

	public String getL3Protocol() {
		return L3Protocol;
	}

	public void setL3Protocol(String l3Protocol) {
		L3Protocol = l3Protocol;
	}

	public String getDestinationMACAddress() {
		return DestinationMACAddress;
	}

	public void setDestinationMACAddress(String destinationMACAddress) {
		DestinationMACAddress = destinationMACAddress;
	}

	@Override
	public String toString() {
		return "L2: " + L2Protocol + " SourceMAC: " +
				SourceMACAddress + "L4: " +
				L4Protocol + "SourceIP: " +
				SourceIPAddress + "summary: " +
				PacketSummary + "ID: " +
				PacketID + "DestIP: " +
				DestinationIPAddress + "Tstamp: " +
				Timestamp.toString() + "DestPort " +
				DestinationPort + "SourcePort: " +
				SourcePort + "L3: " +
				L3Protocol + "DestMac " +
				DestinationMACAddress;
	}
}
