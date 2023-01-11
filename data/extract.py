import json

import bs4
import requests

PATH = "data.json"


def load_csv():
    with open(PATH) as fp:
        return json.load(fp)


def write_csv(data):
    with open(PATH, "w") as fp:
        json.dump(data, fp, indent=2)


def strfix(s):
    s = s.strip()
    s = s.replace("\r\n", " ")
    return s


def get_table(url):
    response = requests.get(url)
    try:
        content = response.content
        for broken in (
            b"\x80",
            b"\x93",
            b"\x94",
            b"\x98",
            b"\x99",
            b"\x9c",
            b"\x9d",
            b"\xc9",
            b"\xe2",
        ):
            content = content.replace(broken, b"")
        content = bs4.BeautifulSoup(content.decode(), "html.parser")
    except Exception as e:
        breakpoint()
    return content.find("table").find("table").find("table")


def parse_day(line_text):
    day = comment = None
    count = 0
    if "Day" in line_text:
        day, remainder = line_text.split("Day", maxsplit=1)
        if ":" in remainder:
            count, remainder = remainder.split(":", maxsplit=1)
            comment = remainder.split("-")[-1]
    return (
        strfix(day.strip().strip("-")) if day else None,
        strfix(comment.strip()) if comment else None,
        count,
    )


def get_journey_data(journey):
    result = {"legs": []}
    current_day = None
    current_day_description = None
    day_count = None
    table = get_table(journey["url"])
    main_table = False
    for line in table.findAll("tr"):
        fields = line.findAll("td")
        line_text = line.text.strip()
        if not main_table:
            if "cumulative" in line_text.lower():
                main_table = True
            continue
        if "your personal journey" in line_text.lower():
            result["days"] = day_count
            break
        if len(fields) == 3:
            # Three columns means it's a normal entry
            if "Post" in fields[1].text:
                continue
            try:
                distance = float(fields[1].text.strip().split("-")[-1])
            except Exception:
                print(f"no float: {fields[1]}")
                distance = 1337  # easier grepping
            comment = strfix(fields[2].text)
            result["legs"].append(
                {
                    "length_miles": distance,
                    "day": current_day,
                    "day_full": current_day_description,
                    "comment": comment,
                    "optional": False,
                }
            )
        elif len(fields) == 1:
            # new day marker, HOPEFULLY, or else we are kind of screwed
            current_day, current_day_description, day_count = parse_day(line_text)
        elif len(fields) == 2:
            # optional, hopefully
            if "bonus" in fields[0].text.lower():
                result["legs"].append(
                    {
                        "length_miles": 0,
                        "day": current_day,
                        "day_full": current_day_description,
                        "comment": fields[1].text.strip(),
                        "optional": True,
                    }
                )
    result["days"] = day_count
    return result


def main():
    data = load_csv()
    for journey in data:
        jdata = get_journey_data(journey)
        journey["legs"] = jdata["legs"]
        journey["days"] = jdata["days"]
    write_csv(data)


if __name__ == "__main__":
    main()
