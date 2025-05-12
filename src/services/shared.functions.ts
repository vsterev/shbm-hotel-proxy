import { ITourist } from "../interfaces/solvex.interface";

export default class SharedFunctions {
    static countOccupancy(tourists: ITourist[]): { adults: number; children: number; infant: number } {
        return tourists.reduce(
            (acc, tourist) => {
                if (tourist.sex === 'MR' || tourist.sex === 'MRS') {
                    acc.adults++;
                } else if (tourist.sex === 'CHD') {
                    acc.children++;
                } else if (tourist.sex === 'INF') {
                    acc.infant++;
                }
                return acc;
            },
            { adults: 0, children: 0, infant: 0 }
        );
    }
    static getTouristAge(date: string, dateCheckin: string) {
        const d1 = new Date(dateCheckin);
        const d2 = new Date(date);
        const [earlier, later] = d1 < d2 ? [d1, d2] : [d2, d1];

        let years = later.getFullYear() - earlier.getFullYear();

        // Adjust if the later date hasn't reached the month/day of the earlier date
        if (
            later.getMonth() < earlier.getMonth() ||
            (later.getMonth() === earlier.getMonth() && later.getDate() < earlier.getDate())
        ) {
            years--;
        }

        return years;
    }
    static childAges(tourists: ITourist[], dateCheckIn: string): number[] {
        const childArray: number[] = [];

        tourists.map(tourist => {
            if (["CHD", "INF"].includes(tourist.sex)) {
                const childAge = SharedFunctions.getTouristAge(tourist.birthDate!, dateCheckIn);
                childArray.push(childAge);
            }
        });

        return childArray;
    }
}