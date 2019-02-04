import { formatData } from '../index';

const mockData = [
  {
    L2Protocol: 'Ether',
    SourceMACAddress: 'f4:8e:38:d9:ae:83',
    L4Protocol: 'UDP',
    SourceIPAddress: '172.16.10.49',
    PacketSummary:
      'Ether / IP / UDP 172.16.10.49:netbios_ns > 172.16.10.255:netbios_ns / NBNSQueryRequest / Raw',
    PacketID: 127,
    DestinationIPAddress: '172.16.10.255',
    Timestamp: { $date: 1541425232890 },
    DestinationPort: 137,
    SourcePort: 137,
    L3Protocol: 'IP',
    DestinationMACAddress: 'ff:ff:ff:ff:ff:ff',
  },
  {
    L2Protocol: 'Ether',
    SourceMACAddress: '08:00:27:9f:45:5e',
    L4Protocol: '',
    SourceIPAddress: '',
    PacketSummary:
      'Ether / IPv6 / UDP fe80::7507:a1c1:386a:28a1:53444 > ff02::1:3:hostmon / LLMNRQuery',
    PacketID: 827,
    DestinationIPAddress: '',
    Timestamp: { $date: 1541425268520 },
    DestinationPort: '',
    SourcePort: '',
    L3Protocol: '',
    DestinationMACAddress: '33:33:00:01:00:03',
  },
];

test(`it formats raw data into a structure that's easy for d3 to handle`, () => {
  expect(
    formatData({
      groupName: 'L2Protocol',
      x: 'Timestamp',
      y: 'SourceMACAddress',
      rawData: mockData,
    })
  ).toEqual([
    {
      data: [
        { x: 1541425232890, y: 'f4:8e:38:d9:ae:83' },
        { x: 1541425268520, y: '08:00:27:9f:45:5e' },
      ],
      id: 'Ether',
    },
  ]);
});
