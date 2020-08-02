drop table if exists Users cascade;
drop table if exists Whitelist cascade;
drop table if exists Canvas cascade;

create table Whitelist (
    group_id varchar(30) primary key
);

create table Users (
    telegram_id varchar(300) primary key,
    group_id varchar(30) NOT NULL,
    last_updated timestamp NOT NULL DEFAULT NOW(),
    accumulated_pixels integer DEFAULT 0,
    notifications bool DEFAULT TRUE,
    foreign key (group_id) references Whitelist
);

create table Canvas (
	telegram_id varchar(300) NOT NULL,
    bitfield bytea,
    last_updated timestamp NOT NULL DEFAULT NOW(),
    foreign key (telegram_id) references Users
);

INSERT INTO Whitelist (group_id) VALUES ('-484684580');
INSERT INTO Users (telegram_id, group_id) VALUES ('250437415', '-484684580');