var dashboard_ctrl = function($scope, $timeout, address_service) {

    function PieChart(obj) {
        this.title = obj.title || ''
        this.name = obj.name || ''
        this.detail1 = obj.detail1 || ''
        this.detail2 = obj.detail2 || ''
        this.current_value = obj.current_value || 0
        this.address_map = obj.address_map || {}
        this.reference = obj.reference || undefined
        this.datafn = obj.datafn || function() {
            return null
        }
        this.data = obj.data || []
    }

    $scope.pies = [
        new PieChart({
            title: 'Messages',
            name: 'pieMessages',
            detail1: 'Total messages processed',
            detail2: 'for all addresses',
            datafn: function(item) {
                return item.messages_out
            },
        }),
        new PieChart({
            title: 'Senders',
            name: 'pieSenders',
            detail1: 'Number of senders',
            datafn: function(item) {
                return item.senders
            },
        }),
        new PieChart({
            title: 'Receivers',
            name: 'pieReceivers',
            detail1: 'Number of receivers',
            datafn: function(item) {
                return item.receivers
            },
        }),
    ];

    // called by address_service each time an address' data changes
    var on_update = function (reason) {
        $timeout(function () {
          if (!reason) reason = '';
          if (reason.split(':')[0] !== 'address') {
              return;
          }
          $scope.pies.forEach(function(pie, i) {
              pie.update()
          })
        })
    };

    // ensure all pie charts use same color for each address
    var pieColors = [$.pfPaletteColors.red, $.pfPaletteColors.blue, $.pfPaletteColors.orange,
        $.pfPaletteColors.green, $.pfPaletteColors.red200
    ]
    var address_color_map = {}
    var color4Address = function(a) {
        if (address_color_map[a])
            return address_color_map[a]
        var index = Object.keys(address_color_map).length
        // always use grey for 'other' pie slice
        if (index >= pieColors.length)
            address_color_map[a] = $.pfPaletteColors.black400
        else
            address_color_map[a] = pieColors[index]
        return address_color_map[a]
    }

    PieChart.prototype.update = function (piedata) {
        var piedata = 0
        this.address_map = {}
        items.forEach(function(item) {
            var data = this.datafn(item)
            // accumulate data for line chart
            piedata += data
            // catagorize data for pie chart
            if (data)
                this.address_map[item.address] = this.address_map[item.address] ? this.address_map[item.address] + data : data;
        }, this)
        this.current_value = piedata;
        // store up to 10 values for line chart
        this.data.push(this.current_value)
        while (this.data.length > 10) {
            this.data.shift()
        }
        this.draw_pie()
        this.draw_lines()
    }

    PieChart.prototype.draw_lines = function() {
        var data = {
            columns: [
                [this.title]
            ],
            type: 'area'
        };
        Array.prototype.push.apply(data.columns[0], this.data)

        if (!this.spark_reference) {
            var sparklineChartConfig = $().c3ChartDefaults().getDefaultSparklineConfig();
            sparklineChartConfig.bindto = '#chart-pf-sparkline-' + this.name;
            sparklineChartConfig.data = data
            this.spark_reference = c3.generate(sparklineChartConfig);
        } else {
            this.spark_reference.load(data)
        }
    }

    PieChart.prototype.draw_pie = function() {
        var pieData = {
            type: 'pie',
            colors: {},
            columns: [],
        };
        var addressvals = Object.keys(this.address_map).map(function(address) {
            return {
                address: address,
                value: this.address_map[address]
            }
        }, this)
        addressvals.sort(function(a, b) {
            return b.value - a.value
        })
        // if there are 6 or more addresses, collapse those not in top 4 into 'other'
        if (addressvals.length >= 6) {
            for (var i = 4, other = 0; i < addressvals.length; ++i) {
                other += addressvals[i].value
            }
            while (addressvals.length > 4)
                addressvals.pop()
            addressvals.push({
                address: 'Other',
                value: other
            })
        }
        addressvals.forEach(function(av) {
            pieData.colors[av.address] = color4Address(av.address)
            pieData.columns.push([av.address, av.value])
        })

        // only call c3.generate() once. after that call .load()
        // otherwise c3 will leak memory. https://github.com/c3js/c3/issues/926
        if (!this.reference) {
            var c3ChartDefaults = $().c3ChartDefaults();
            var pieChartSmallConfig = c3ChartDefaults.getDefaultPieConfig();
            pieChartSmallConfig.bindto = '#pie-chart-' + this.name;
            pieChartSmallConfig.data = pieData;
            pieChartSmallConfig.legend = {
                show: true,
                position: 'right'
            };
            pieChartSmallConfig.size = {
                width: 260,
                height: 115
            };
            this.reference = c3.generate(pieChartSmallConfig);
        } else {
            this.reference.load(pieData)
        }
    }
    $scope.$on('$destroy', function() {
        $scope.pies.forEach(function(pie) {
            if (pie.reference) pie.reference.destroy()
            if (pie.spark_reference) pie.spark_reference.destroy()
        })
    })

    var items = address_service.addresses;
    address_service.on_update(on_update)

    // draw charts without waiting for on_update event from address_service
    on_update("address")
}

angular.module('patternfly.toolbars').controller('DashCtrl', ['$scope', '$timeout', 'address_service', dashboard_ctrl])