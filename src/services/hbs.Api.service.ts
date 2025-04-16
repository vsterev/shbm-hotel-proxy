import envVaraibles from "../config/envVariables";

export default class HbsAPI {

  static async confirmBooking(data: {
    bookingNumber: string;
    confirmationNumber: string;
    message: string;
  }) {
    try {

      const promiseResult = await fetch(
        `${envVaraibles.HBS_URL}/api/v1/bookings/confirm`,
        {
          method: "POST",
          headers: { "Content-type": "application/json", Authorization: 'Bearer ' + envVaraibles.API_TOKEN_MAIN },
          body: JSON.stringify(data),
        },
      );

      if (!promiseResult.ok) {
        return;
      }

      const result = await promiseResult.json();
      return result;

    } catch (error) {
      throw error
    }
  }

  static async denialBooking(data: {
    bookingNumber: string;
    message: string;
  }) {
    try {

      const promiseResult = await fetch(
        `${envVaraibles.HBS_URL}/api/v1/bookings/deny`,
        {
          method: "POST",
          headers: { "Content-type": "application/json", Authorization: 'Bearer ' + envVaraibles.API_TOKEN_MAIN },
          body: JSON.stringify(data),
        },
      );

      if (!promiseResult.ok) {
        return;
      }

      const result = await promiseResult.json();
      return result;

    } catch (error) {
      throw error
    }
  }

}
