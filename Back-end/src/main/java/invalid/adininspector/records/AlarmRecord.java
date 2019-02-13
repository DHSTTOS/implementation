/* Copyright (C) 2018,2019 Mario A. Gonzalez Ordiano - All Rights Reserved
 * For any questions please contact me at: mario,ordiano@gmail.com
 */
package invalid.adininspector.records;

/**
 * The attributes of this class correspond to the data format for the
 * ADIN framework's alarm/notification data.
 * The values of an alarm/notification record are stored strings in JSON format.
 * 
 * This class has a setter and getter method for every attribute.
 */
public class AlarmRecord extends Record{

	private String AlarmID;
	private String AlarmType;
	private Timestamp AlarmOccurrenceTime;
	private String AlarmCategory;
	private String AlarmScore;
	private String AlarmDescription;
	private String PacketSummary;

	/**
	 * @return the alarmId
	 */
	public String getAlarmID() {
		return AlarmID;
	}

	/**
	 * @return the packetSummary
	 */
	public String getPacketSummary() {
		return PacketSummary;
	}

	/**
	 * @param packetSummary the packetSummary to set
	 */
	public void setPacketSummary(String packetSummary) {
		this.PacketSummary = packetSummary;
	}

	/**
	 * @return the alarmDescription
	 */
	public String getAlarmDescription() {
		return AlarmDescription;
	}

	/**
	 * @param alarmDescription the alarmDescription to set
	 */
	public void setAlarmDescription(String alarmDescription) {
		this.AlarmDescription = alarmDescription;
	}

	/**
	 * @return the alarmScore
	 */
	public String getAlarmScore() {
		return AlarmScore;
	}

	/**
	 * @param alarmScore the alarmScore to set
	 */
	public void setAlarmScore(String alarmScore) {
		this.AlarmScore = alarmScore;
	}

	/**
	 * @return the alarmCategory
	 */
	public String getAlarmCategory() {
		return AlarmCategory;
	}

	/**
	 * @param alarmCategory the alarmCategory to set
	 */
	public void setAlarmCategory(String alarmCategory) {
		this.AlarmCategory = alarmCategory;
	}

	/**
	 * @return the alarmOccurrenceTime
	 */
	public String getAlarmOccurrenceTime() {
		return AlarmOccurrenceTime.toString();
	}

	/**
	 * @param alarmOccurrenceTime the alarmOccurrenceTime to set
	 */
	public void setAlarmOccurrenceTime(Timestamp alarmOccurrenceTime) {
		this.AlarmOccurrenceTime = alarmOccurrenceTime;
	}

	/**
	 * @return the alarmType
	 */
	public String getAlarmType() {
		return AlarmType;
	}

	/**
	 * @param alarmType the alarmType to set
	 */
	public void setAlarmType(String alarmType) {
		this.AlarmType = alarmType;
	}

	/**
	 * @param alarmId the alarmId to set
	 */
	public void setAlarmID(String alarmId) {
		this.AlarmID = alarmId;
	}
}
