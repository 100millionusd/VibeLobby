/**
 * SERVICE: Affiliate Deep Linker
 * 
 * Handles the generation of partner URLs with correct date formatting and tracking parameters.
 */

export class AffiliateDeepLinker {
  
    /**
     * Generates a deep link for Booking.com Search Results
     * 
     * @param query - The search query (e.g. "Dubai" or "Generator Berlin, Berlin")
     * @param checkIn - Date object for check-in
     * @param checkOut - Date object for check-out
     * @param aid - Your Booking.com Affiliate ID
     * @param activityLabel - The 'vibe' tag (passed as label/sub_id for reporting)
     */
    static generateBookingLink(
      query: string,
      checkIn: Date,
      checkOut: Date,
      aid: string,
      activityLabel: string
    ): string {
      // 1. Error Handling: Validate Dates
      if (checkOut <= checkIn) {
        console.warn('AffiliateDeepLinker: Check-out must be after check-in. Defaulting to +1 day.');
        const nextDay = new Date(checkIn);
        nextDay.setDate(checkIn.getDate() + 1);
        checkOut = nextDay;
      }
  
      // 2. Format Dates (Booking.com expects YYYY-MM-DD)
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
      // 3. Construct URL
      // We use the 'searchresults.html' endpoint which accepts an 'ss' (Search String) parameter.
      // This is robust: if the hotel name matches exactly, it often shows first. If not, it shows the city.
      
      const baseUrl = `https://www.booking.com/searchresults.html`;
      const params = new URLSearchParams({
        ss: query, // Search String
        aid: aid,
        checkin: formatDate(checkIn),
        checkout: formatDate(checkOut),
        group_adults: '1',
        no_rooms: '1',
        label: `vibelobby_${activityLabel.toLowerCase()}`, // Tracking label for your dashboard
        utm_campaign: 'vibelobby_app'
      });
  
      return `${baseUrl}?${params.toString()}`;
    }
  
    /**
     * Generates a deep link for Travala.com
     * 
     * @param hotelId - The Travala property ID
     * @param checkIn - Date object for check-in
     * @param checkOut - Date object for check-out
     * @param refCode - Your Travala Affiliate Ref Code
     */
    static generateTravalaLink(
      hotelId: string,
      checkIn: Date,
      checkOut: Date,
      refCode: string
    ): string {
      // 1. Validate Dates
      if (checkOut <= checkIn) {
        const nextDay = new Date(checkIn);
        nextDay.setDate(checkIn.getDate() + 1);
        checkOut = nextDay;
      }
  
      // 2. Format Dates (Travala expects YYYY-MM-DD)
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
      // 3. Construct URL
      // Travala structure: https://www.travala.com/hotel/property-slug?checkIn=...
      const baseUrl = `https://www.travala.com/hotel/${hotelId}`;
      const params = new URLSearchParams({
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut),
        rooms: '1',
        adults: '1',
        ref: refCode
      });
  
      return `${baseUrl}?${params.toString()}`;
    }
  }