# DigiRent.bdl — GA4 event plan

| Event | Trigger | Parameters | Interpretation |
|---|---|---|---|
| `click_wa_booking` | Booking form is valid and user clicks submit to open WhatsApp | `camera_model`, `rental_duration_hours`, `rental_date`, `booking_purpose` | Intent to contact; not a confirmed booking |
| `use_calculator` | User submits the calculator | `camera_model`, `rental_duration_hours`, `accessory_type`, `estimated_price`, `currency` | Calculator engagement |
| `view_tnc_page` | Terms page is loaded | `page_type` | Page view, not proof the terms were read |
| `download_order_format` | Clipboard copy succeeds | `action_type=copy`, `format_name` | Copy action; name retained for assignment requirement |
| `click_wa_contact` | Generic WhatsApp contact link clicked | `contact_method`, `contact_location` | Contact intent |
| `tnc_content_engaged` | Optional future enhancement: visitor reaches bottom of T&C | `page_type` | Indicates scroll engagement, not proof of full reading |
| `gallery_filter` | Gallery filter selected | `gallery_filter` | Gallery interaction |
| `faq_open` | FAQ accordion opened | `faq_question` | FAQ engagement |

## GA4 notes
- Use a real GA4 Measurement ID (format `G-XXXXXXXXXX`); the academic reference `20262-DIGMAREG-KLKx` is not a valid GA4 Measurement ID.
- Do not log personal identity data or full WhatsApp messages as analytics parameters.
- To report custom parameters in GA4 reports, register custom dimensions/metrics as appropriate.
- Define booking conversion rate explicitly for the assignment, e.g. sessions with `click_wa_booking` / all sessions. Do not confuse a WhatsApp click with confirmed rental.
- Give the lecturer `muji@feb.unila.ac.id` Viewer access from GA4 Property access management; this cannot be granted from website code.
