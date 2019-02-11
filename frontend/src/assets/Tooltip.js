window.Tooltip = function(tooltipId, width) {
  $('body').append("<div class='tooltip' id='" + tooltipId + "'></div>");

  $('#' + tooltipId).css('position', 'absolute');
  $('#' + tooltipId).css('z-index', 10000); // don't laugh. you'll see
  $('#' + tooltipId).css('opacity', 0.8);

  if (width) {
    $('#' + tooltipId).css('width', width);
  }

  hideTooltip();

  function showTooltip(content, event) {
    $('#' + tooltipId).html(content);
    $('#' + tooltipId).show();

    updatePosition(event);
  }

  function hideTooltip() {
    $('#' + tooltipId).hide();
  }

  function updatePosition(event) {
    var ttid = '#' + tooltipId;
    var xOffset = 20;
    var yOffset = 10;

    var toolTipW = $(ttid).width();
    var toolTipeH = $(ttid).height();
    var windowY = $(window).scrollTop();
    var windowX = $(window).scrollLeft();
    var curX = event.pageX;
    var curY = event.pageY;
    var ttleft =
      curX < $(window).width() / 2
        ? curX - toolTipW - xOffset * 2
        : curX + xOffset;
    if (ttleft < windowX + xOffset) {
      ttleft = windowX + xOffset;
    }
    var tttop =
      curY - windowY + yOffset * 2 + toolTipeH > $(window).height()
        ? curY - toolTipeH - yOffset * 2
        : curY + yOffset;
    if (tttop < windowY + yOffset) {
      tttop = curY + yOffset;
    }
    $(ttid)
      .css('top', tttop + 'px')
      .css('left', ttleft + 'px');
  }

  return {
    showTooltip: showTooltip,
    hideTooltip: hideTooltip,
    updatePosition: updatePosition,
  };
};
