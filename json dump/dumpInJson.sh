#!/bin/bash

DB=AdinInspector
Array=( "lemgo"
        "lemgo_AddressesAndLinks"
        "lemgo_FlowRatePerSecond"
        "lemgo_NumberOfConnectionsPerNode"
        "lmf"
        "lmf_AddressesAndLinks"
        "lmf_FlowRatePerSecond"
        "lmf_NumberOfConnectionsPerNode"
        "motor"
        "motor_AddressesAndLinks"
        "motor_FlowRatePerSecond"
        "motor_NumberOfConnectionsPerNode")


for i in ${Array[@]}; do
       mongoexport -d $DB -c ${i} -o ./${i}.json
done
