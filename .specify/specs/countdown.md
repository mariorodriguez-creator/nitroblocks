Countdown markdown 

# Overview
 
This document describes the "Countdown component", whose role is to display the time left to a specific event.
 
# Configuration
 
The configuration dialog of the component will contain the following settings:
* Settings tab
   * Pretitle: RTE field to hold the text in yellow that goes above the title. For example: "PARQUE MAEDA - SAO PAULO". optional
   * Title: RTE field for the main title of the event. For example: "BELGIAN GP", optional.
   * Event fieldset:
      * Date Time: Date time picker. Required.
      * Time Zone: Dropdown for the author to indicate what time zone the event will take place at. Dropdown with a comprehensive list of time zones. Required.
   * Countdown labels:
      * Days: string field. Required. Default value: DAYS.
      * Hours: string field. Required. Default value: HOURS.
      * Minutes: string field. Required. Default value: MINUTES.
      * Seconds: string field. Required. Default value: SECONDS.
   * Button fieldset:
      * Page: Content path picker, optional
      * Label: textbox, optional
* Milestones tab:
   * Multifield composed of:
      * Title: for example, "OCTOBER", or "QUALIFYING" or "RACE"
      * Text1: text before the separator line. For example: "10-12", or "14:00 GMT"
      * Text2: text after the separator line. For example: "2025", or "27th OCT"
* Background tab:
    * Desktop image: DAM path picker, optional
    * Tablet image: DAM path picker, optional
    * Mobile image: DAM path picker, optional
* Styles tab:
   * Spacing bottom: dropdown with the following values: None, Small, Medium, Large
 
The event must be stored in the JCR with date and time indicated by the author, replacing the timezone that comes from the date time picker with the time zone selected by the authoring in the time zone dropdown. For example, if the date time pickers holds a value of "2025-12-25 12:00:00 CET" and the author selected Europe/London in the time zone dropdown, the datetime that should be stored in the JCR should be "2025-12-25 12:00:00 GMT".
 
The author will be able to add between 0 to 2 milestones, so, after adding the 2nd milestone, the "add" button of the multifield should be disabled. They author will be able to remove and rearrange the order of the milestones.
 
On the Style tab:
* The "Spacing bottom" is the regular DXn spacing bottom dropdown, that will add a padding-bottom based on the CAC theming variables (Layout: Spacing > bottom-small-{viewport-size}, bottom-medium-{viewport-size}, bottom-large-{viewport-size})
 
 
# Component Logic
 
The component will display the time remaining until the event indicated in the configuration dialog, updating each second.
 
When the countdown reaches the end, it will show 00, 00, 00, 00 and stops updating.

