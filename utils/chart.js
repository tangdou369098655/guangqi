function initBarList({
    id, data,
    color, dstColor
}) {
    if (!echarts) {
        return console.error("not echarts!")
    }
    var xdata = [];
    var ydata = [];
    var values = data.sort((a, b) => {
        return a.value - b.value
    })
    for (let i = 0; i < values.length; i++) {
        var elem = values[i];
        xdata.push(elem.value);
        if (elem.name) ydata.push(elem.name);
    }
    // max number
    var max = Math.max.apply(null, xdata)
    function returnOption(xdata, ydata) {
        data = data || [];
        return {
            grid: {
                left: '3%',
                right: 35,
                top: 20,
                bottom: 0,
                containLabel: true
            },
            xAxis: {
                type: 'value',
                axisTick: { show: false },
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    show: false,
                    textStyle: {
                        color: '#58595b',
                        fontSize: 16
                    }
                },
                splitLine: {
                    show: false
                },
            },
            yAxis: {
                type: 'category',
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: '#58595b',
                        fontSize: 20
                    }
                },
                axisTick: {
                    show: false, //隐藏Y轴刻度
                },
                axisLine: {
                    show: false, //隐藏Y轴线段
                },
                offset: 20,
            },
            series: [
                {
                    name: 'value',
                    type: 'bar',
                    barWidth: 13,
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                            color: "#fff",
                            formatter: "{c}"
                        }
                    },
                    itemStyle: {
                        normal: {
                            show: true,
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                                offset: 0,
                                color: color
                            }, {
                                offset: 1,
                                color: dstColor
                            }]),
                            barBorderRadius: 8,
                            borderWidth: 0,
                            borderColor: '#333',
                        }
                    },
                    data: xdata
                },
                //年份
                {
                    name: "name",
                    show: true,
                    type: 'bar',
                    // xAxisIndex: 1, //代表使用第二个X轴刻度
                    barGap: '-100%',
                    barWidth: '10%',
                    itemStyle: {
                        normal: {
                            barBorderRadius: 200,
                            color: 'transparent'
                        }
                    },
                    label: {
                        normal: {
                            show: true,
                            position: [0, '-20'],
                            textStyle: {
                                fontSize: 14,
                                color: '#fff',
                            },
                            formatter: function (data) {
                                return ydata[data.dataIndex];
                            }
                        }
                    },
                    data: xdata
                }

            ]
        }
    }
    var option = returnOption(xdata, ydata)
    var myChart = echarts.init(document.getElementById(id));
    myChart.setOption(option);
    this.update = function (data) {
        var xdata = [];
        var ydata = [];
        var values = data.sort((a, b) => {
            return a.value - b.value
        })
        for (let i = 0; i < values.length; i++) {
            var elem = values[i];
            xdata.push(elem.value);
            if (elem.name) ydata.push(elem.name);
        }
        var option = returnOption(xdata, ydata);
        myChart.setOption(option);
    }
    this.resize = function () {
        myChart.resize();
    }
}
function initLineList({
    id, data
}) {
    /**
     * @param {string} id 盒子ID
     * @param {arrary} data 数据 {date,value}
     * 
     */
    function returnOption(data) {
        data = data || [];
        let values=[],names=[];
        data.forEach(elem=>{
            values.push(elem.value);
            names.push(elem.name);
        })
        return {
            backgroundColor: 'transparent',

            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    lineStyle: {
                        color: '#57617B'
                    }
                }
            },
            legend: {
                icon: 'rect',
                itemWidth: 14,
                itemHeight: 5,
                itemGap: 13,
                right: '4%',
                textStyle: {
                    fontSize: 12,
                    color: '#292f39'
                }
            },
            grid: {
                top: 15,
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    lineStyle: {
                        color: '#fff'
                    }
                },
                data: names
            }],
            yAxis: [{
                type: 'value',
                name: '',
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                axisLabel: {
                    margin: 10,
                    textStyle: {
                        fontSize: 12
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#18304f',
                        type: "dashed"
                    }
                }
            }],
            series: [{
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 2,
                showSymbol: false,
                lineStyle: {
                    normal: {
                        width: 2
                    }
                },
                areaStyle: {
                    normal: {
                        //线性渐变，前4个参数分别是x0,y0,x2,y2(范围0~1);相当于图形包围盒中的百分比。如果最后一个参数是‘true’，则该四个值是绝对像素位置。
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                            offset: 0,
                            color: 'rgba(30,254,209,0.3)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(30,254,209,0)'
                        }
                        ], false),
                        shadowColor: 'rgba(53,142,215, 0.9)', //阴影颜色
                        shadowBlur: 10 //shadowBlur设图形阴影的模糊大小。配合shadowColor,shadowOffsetX/Y, 设置图形的阴影效果。
                    }
                },
                itemStyle: {
                    normal: {

                        color: "#1effd2"
                    },
                    emphasis: {
                        color: 'rgb(0,196,132)',
                        borderColor: 'rgba(0,196,132,0.2)',
                        extraCssText: 'box-shadow: 8px 8px 8px rgba(0, 0, 0, 1);',
                        borderWidth: 10
                    }
                },
                data: values
            }]
        }
    }
    var option = returnOption(data)
    var myChart = echarts.init(document.getElementById(id));
    myChart.setOption(option);
    this.resize = function () {
        myChart.resize();
    }
    this.update=function(data){
        var option = returnOption(data);
        myChart.setOption(option);
    }
}