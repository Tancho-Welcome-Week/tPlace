drop table if exists Users cascade;
drop table if exists Masterlist cascade;
drop table if exists Canvas cascade;

create table Users (
    telegram_id varchar(20) primary key,
    last_updated timestamp NOT NULL DEFAULT NOW(),
    accumulated_pixels integer
);

create table Masterlist (
    group_id varchar(20) primary key
);

create table Canvas (
	telegram_id varchar(20) NOT NULL,
    bitfield bytea,
    last_updated timestamp NOT NULL DEFAULT NOW(),
    primary key (bitfield, last_updated),
    foreign key (telegram_id) references Users
);