package invalid.adininspector.records;

import java.util.Map;

//TODO:add method too iterate over the map
public class MiscRecord extends Record{
    private Map<String, Object> properties;

    /**
     * @return the properties
     */
    public Map<String, Object> getProperties() {
        return properties;
    }

    /**
     * @param properties the properties to set
     */
    public void setProperties(Map<String, Object> properties) {
        this.properties = properties;
    }

    
}