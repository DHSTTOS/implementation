package invalid.adininspector.backend.records;

public class AlarmRecord extends Record{

    private String AlarmID;
    private String AlarmType;
    private Timestamp AlarmOccurrenceTime;
    private String AlarmCategory;
    private String AlarmScore;
    private String AlarmDescription;
    private String PacketSummary;



    //ankush's thing contains an object so this must also be a object
    public class Timestamp {
        //should be stored as UNIX timestamp? right??
        public String $date;

        public Timestamp(String $date) {
            this.$date = $date;
        }

        @Override
        public String toString() {
            return $date;
        }
    }


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
